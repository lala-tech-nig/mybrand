const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Brand = require('../models/Brand');
const axios = require('axios'); // For Flutterwave verification

// Helper: Verify Flutterwave Transaction
const verifyPayment = async (transaction_id, expectedAmount) => {
    try {
        const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
        });
        const data = response.data.data;
        if (data.status === "successful" && data.amount >= expectedAmount && data.currency === "NGN") {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Payment verification failed:", error.message);
        return false;
    }
};

// Register a new Brand
const upload = require('../middleware/upload');

// Handle Optional Logo Upload during registration
router.post('/register', upload.single('logo'), async (req, res) => {
    try {
        const { username, email, password, brandName, fullName, whatsappNumber, tier, cacRegistered, cacNumber } = req.body;

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
            registered: cacRegistered === 'true' || cacRegistered === true, // Handle multipart/form-data string conversion
            regNumber: cacNumber || ''
        };

        // File Upload Handling
        let logoUrl = '';
        if (req.file) {
            logoUrl = req.file.path;
        }

        // Subscription Logic
        let selectedTier = tier || 'Free';
        let isVerified = false;
        let subscription = {
            status: 'Inactive',
            startDate: null,
            endDate: null,
            lastPaymentDate: null
        };

        if (selectedTier === 'Premium') {
            if (!transaction_id) {
                return res.status(400).json({ message: 'Payment required for Premium registration' });
            }
            // Verify payment (assume monthly 2000 for simplicity of check, or verify exact amount if duration known)
            // We use 2000 as base. If they paid yearly (19200), it will also pass (>= 2000).
            const isValid = await verifyPayment(transaction_id, 2000);
            if (!isValid) {
                return res.status(400).json({ message: 'Payment verification failed' });
            }

            isVerified = true;
            const now = new Date();
            const nextMonth = new Date(now);
            nextMonth.setDate(now.getDate() + 30); // Default to monthly on signup for now

            subscription = {
                status: 'Active',
                startDate: now,
                endDate: nextMonth,
                lastPaymentDate: now
            };
        }

        brand = new Brand({
            username,
            email,
            password: hashedPassword,
            brandName,
            fullName, // [NEW]
            whatsappNumber,
            tier: selectedTier,
            subscription, // [NEW]
            cacDetails,
            logoUrl
        });

        await brand.save();

        // Create Token
        const payload = { brand: { id: brand.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, brand: { id: brand.id, username, brandName, fullName, logoUrl } });
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
