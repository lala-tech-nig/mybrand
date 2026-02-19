const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://mybrand-two.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // Serve uploaded files


// Make io accessible to routes
app.set('io', io);

// Basic Route
app.get('/', (req, res) => {
    res.send('my Brand API is running');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/products', require('./routes/products'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/public', require('./routes/public'));
app.use('/api/drags', require('./routes/drags'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/brand-search', require('./routes/brandSearch'));


// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join brand-specific room
    socket.on('join_brand', (brandId) => {
        socket.join(`brand_${brandId}`);
        console.log(`User ${socket.id} joined brand room: ${brandId}`);
    });

    // Leave brand room
    socket.on('leave_brand', (brandId) => {
        socket.leave(`brand_${brandId}`);
        console.log(`User ${socket.id} left brand room: ${brandId}`);
    });

    // Real-time typing indicator (for future chat/comment features)
    socket.on('typing', ({ brandId, username }) => {
        socket.to(`brand_${brandId}`).emit('user_typing', { username });
    });

    // Broadcast new follower event
    socket.on('new_follower', ({ brandId, followerName }) => {
        io.to(`brand_${brandId}`).emit('follower_added', { followerName, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mybrand')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
