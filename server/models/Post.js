const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    content: { type: String },
    imageUrl: { type: String },
    likes: [{ type: String }], // Array of user/IP IDs for simplicity initially
    comments: [{
        text: { type: String, required: true },
        authorBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // If logged in as brand
        isAnonymous: { type: Boolean, default: true },
        guestName: { type: String }, // Optional name for anonymous users
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
