const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Brand = require('../models/Brand');

// Register a new Brand
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, brandName, whatsappNumber, tier, cacRegistered, cacNumber } = req.body;

        // Check if brand exists
        let brand = await Brand.findOne({ $or: [{ email }, { username }] });
        if (brand) {
            return res.status(400).json({ message: 'Brand already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Construct CAC details
        const cacDetails = {
            registered: cacRegistered || false,
            regNumber: cacNumber || ''
        };

        brand = new Brand({
            username,
            email,
            password: hashedPassword,
            brandName,
            whatsappNumber,
            tier: tier || 'Free',
            cacDetails
            // Default theme color is already set in model
        });

        await brand.save();

        // Create Token
        const payload = { brand: { id: brand.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, brand: { id: brand.id, username, brandName } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login Brand
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let brand = await Brand.findOne({ email });
        if (!brand) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, brand.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { brand: { id: brand.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, brand: { id: brand.id, username: brand.username, brandName: brand.brandName } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Current Brand
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
    try {
        const brand = await Brand.findById(req.brand.id).select('-password');
        res.json({ brand });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
