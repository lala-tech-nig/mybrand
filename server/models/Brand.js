const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    brandName: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String },

    // Brand Identity & Settings
    logoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    coverImages: [{ type: String }], // Multiple sliding banner images (Premium feature)
    themeColor: { type: String, default: '#000000' },

    // Business Details
    tier: {
        type: String,
        enum: ['Free', 'Premium'],
        default: 'Free'
    },
    subscription: {
        status: { type: String, enum: ['Active', 'Inactive', 'Expired', 'None'], default: 'None' },
        startDate: { type: Date },
        endDate: { type: Date },
        lastPaymentDate: { type: Date }
    },

    tierPrice: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    // Status Gems (Premium feature)
    statusGem: {
        type: String,
        enum: ['None', 'Bronze', 'Silver', 'Gold', 'Diamond'],
        default: 'None'
    },
    gemExpiry: { type: Date, default: null },

    cacDetails: {
        registered: { type: Boolean, default: false },
        regNumber: { type: String, default: '' }
    },

    // Engagement & Reputation
    engagementScore: { type: Number, default: 0 },
    badges: [{
        name: { type: String },
        icon: { type: String },
        dateAwarded: { type: Date, default: Date.now }
    }],

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],

    // Analytics
    views: { type: Number, default: 0 },
    productClicks: { type: Number, default: 0 },

    whatsappNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', BrandSchema);
