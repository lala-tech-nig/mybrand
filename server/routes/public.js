const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Post = require('../models/Post');

const Drag = require('../models/Drag');

// Get Brand by username (path-based routing: /username)
router.get('/:subdomain', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.subdomain })
            .select('-password -email'); // Exclude sensitive info

        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Session-based view tracking (prevent duplicate counts on refresh)
        const cookieName = `viewed_brand_${brand._id}`;
        const hasViewed = req.cookies[cookieName];

        if (!hasViewed) {
            // Increment view count only if not viewed in last 24 hours
            brand.views = (brand.views || 0) + 1;
            await brand.save();

            // Set cookie for 24 hours
            res.cookie(cookieName, 'true', {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true,
                sameSite: 'lax'
            });
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

        const posts = await Post.find({ brand: brand._id, isHidden: { $ne: true } })
            .sort({ createdAt: -1 })
            .populate('comments.authorBrand', 'brandName logoUrl'); // Populate brand info in comments if available

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Brand Drags (Accountability)
router.get('/:subdomain/drags', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.subdomain });
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const drags = await Drag.find({ targetBrand: brand._id })
            .sort({ createdAt: -1 })
            .populate('author', 'brandName username logoUrl')
            .populate('comments.authorBrand', 'brandName logoUrl');

        res.json(drags);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
