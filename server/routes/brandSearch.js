const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// Brand search endpoint for @ mentions
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json([]);
        }

        // Search brands by brandName or username
        const brands = await Brand.find({
            $or: [
                { brandName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } }
            ]
        })
            .select('brandName username logoUrl')
            .limit(10);

        res.json(brands);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
