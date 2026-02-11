const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Post = require('../models/Post');

// Get Brand by Subdomain (username)
router.get('/:subdomain', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.subdomain })
            .select('-password -email'); // Exclude sensitive info

        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.json(brand);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Brand Products
router.get('/:subdomain/products', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.subdomain });
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const products = await Product.find({ brand: brand._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Brand Posts
router.get('/:subdomain/posts', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.subdomain });
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const posts = await Post.find({ brand: brand._id })
            .sort({ createdAt: -1 })
            .populate('comments.authorBrand', 'brandName logoUrl'); // Populate brand info in comments if available

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
