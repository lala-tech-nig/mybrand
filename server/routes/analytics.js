const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');

const ProductClick = require('../models/ProductClick');

// Increment product clicks
router.post('/product-click/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Increment product clicks (Fast Counter)
        product.clicks = (product.clicks || 0) + 1;
        await product.save();

        // Also increment brand's total product clicks
        const brand = await Brand.findById(product.brand);
        if (brand) {
            brand.productClicks = (brand.productClicks || 0) + 1;
            await brand.save();
        }

        // [NEW] Log Detailed Click Event
        try {
            const newClick = new ProductClick({
                product: product._id,
                brand: product.brand,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            });
            await newClick.save();
        } catch (logErr) {
            console.error("Failed to log detailed click", logErr);
            // Don't fail the request just because logging failed
        }

        res.json({ msg: 'Click tracked', clicks: product.clicks });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Increment Brand Views (legacy endpoint)
router.post('/brand/:id/view', async (req, res) => {
    try {
        await Brand.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Increment Product Clicks (legacy endpoint)
router.post('/brand/:id/click', async (req, res) => {
    try {
        await Brand.findByIdAndUpdate(req.params.id, { $inc: { productClicks: 1 } });
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
