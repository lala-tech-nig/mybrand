const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

// Get all products for a brand
router.get('/brand/:brandId', async (req, res) => {
    try {
        const products = await Product.find({ brand: req.params.brandId }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a product (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, price, images } = req.body;

        const newProduct = new Product({
            brand: req.brand.id,
            name,
            description,
            price,
            images: images || []
        });

        const product = await newProduct.save();

        // Emit Socket.io event
        req.app.get('io').to(`brand_${req.brand.id}`).emit('new_product', product);

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a product (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, price, images } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check ownership
        if (product.brand.toString() !== req.brand.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { name, description, price, images } },
            { new: true }
        );

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a product (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.brand.toString() !== req.brand.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
