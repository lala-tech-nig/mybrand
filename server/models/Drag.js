const mongoose = require('mongoose');

const DragSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true }, // Who is dragging
    targetBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // Who is being dragged (optional ref if on platform)
    targetBrandName: { type: String, required: true }, // Name of brand being dragged (fallback)

    content: { type: String, required: true },
    likes: [{ type: String }], // Array of IP/User IDs
    views: { type: Number, default: 0 },

    comments: [{
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // If logged in
        isAnonymous: { type: Boolean, default: true },
        guestName: { type: String },
        likes: [{ type: String }], // Likes on comments
        replies: [{
            text: { type: String, required: true },
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
            createdAt: { type: Date, default: Date.now }
        }],
        createdAt: { type: Date, default: Date.now }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Drag', DragSchema);
