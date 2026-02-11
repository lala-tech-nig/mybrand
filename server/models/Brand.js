const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Acts as subdomain
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    brandName: { type: String, required: true },
    description: { type: String },

    // Brand Identity & Settings
    logoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    themeColor: { type: String, default: '#000000' }, // Default to Black/Standard

    // Business Details
    tier: {
        type: String,
        enum: ['Free', 'Basic', 'Standard', 'Premium', 'Gold'], // Mapping 1k, 2k, 3k, 5k to names or keeping as values used in logic. 
        // User said: "Free, 1k, 2k, 3k, 5k". Let's use keys that represent these.
        // Actually user said "prices... are free, 1k, 2k, 3k, 5k". Let's use descriptive keys: 'Free', 'Tier1', 'Tier2', 'Tier3', 'Tier4' or just the amounts.
        // Let's stick to the user's terminology if possible or map them.
        // "Basic, like 5 tiers" -> Free, 1k, 2k, 3k, 5k.
        default: 'Free'
    },
    tierPrice: { type: Number, default: 0 }, // 0, 1000, 2000, 3000, 5000
    isVerified: { type: Boolean, default: false },

    cacDetails: {
        registered: { type: Boolean, default: false },
        regNumber: { type: String, default: '' } // RC or BN number
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    whatsappNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', BrandSchema);
