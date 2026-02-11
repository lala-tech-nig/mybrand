const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Post = require('../models/Post');

// Get Brand by Subdomain (Username)
router.get('/:username', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.username }).select('-password');
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const products = await Product.find({ brand: brand._id }).sort({ createdAt: -1 });
        const posts = await Post.find({ brand: brand._id }).sort({ createdAt: -1 });

        res.json({ brand, products, posts });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// Update Brand Settings
const auth = require('../middleware/auth');
router.put('/settings', auth, async (req, res) => {
    try {
        const { themeColor, logoUrl, coverUrl, description } = req.body;

        // Find brand by ID from token
        let brand = await Brand.findById(req.brand.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        // Update fields
        if (themeColor) brand.themeColor = themeColor;
        if (logoUrl) brand.logoUrl = logoUrl;
        if (coverUrl) brand.coverUrl = coverUrl;
        if (description) brand.description = description;

        await brand.save();
        res.json(brand);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
