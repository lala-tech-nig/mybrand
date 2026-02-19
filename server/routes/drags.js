const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Drag = require('../models/Drag');
const Brand = require('../models/Brand');

// Create a Drag (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { targetBrandName, content } = req.body;

        // Try to find target brand if it exists on platform
        let targetBrandId = null;
        if (targetBrandName) {
            // Remove @ if present
            const cleanName = targetBrandName.replace('@', '').trim();
            const targetBrand = await Brand.findOne({
                $or: [{ username: cleanName }, { brandName: new RegExp(cleanName, 'i') }]
            });
            if (targetBrand) {
                targetBrandId = targetBrand._id;
            }
        }

        const newDrag = new Drag({
            author: req.brand.id,
            targetBrand: targetBrandId, // Can be null if not found
            targetBrandName: targetBrandName || 'Unknown Brand',
            content
        });

        const drag = await newDrag.save();

        // Notify target if they exist on platform via Socket.io
        if (targetBrandId) {
            req.app.get('io').to(`brand_${targetBrandId}`).emit('new_drag', drag);
        }

        res.json(drag);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Drags aiming at a specific brand
router.get('/target/:brandId', async (req, res) => {
    try {
        const drags = await Drag.find({ targetBrand: req.params.brandId })
            .populate('author', 'brandName username logoUrl')
            .sort({ createdAt: -1 });
        res.json(drags);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Drags created by a specific brand
router.get('/author/:brandId', async (req, res) => {
    try {
        const drags = await Drag.find({ author: req.params.brandId })
            .populate('targetBrand', 'brandName username logoUrl')
            .sort({ createdAt: -1 });
        res.json(drags);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get All Drags (Feed)
router.get('/', async (req, res) => {
    try {
        const { sort } = req.query;
        let sortOption = { createdAt: -1 };

        if (sort === 'trending') {
            // MongoDB sort optimization needed for array length or virtuals? 
            // For now, simpler to fetch and sort in memory if dataset small, or use aggregate.
            // Let's use aggregate for scalable sorting.
            const drags = await Drag.aggregate([
                {
                    $lookup: {
                        from: 'brands',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                { $unwind: '$author' },
                {
                    $lookup: {
                        from: 'brands',
                        localField: 'targetBrand',
                        foreignField: '_id',
                        as: 'targetBrand'
                    }
                },
                {
                    $unwind: {
                        path: '$targetBrand',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        commentsCount: { $size: "$comments" },
                        likesCount: { $size: { $ifNull: ["$likes", []] } }
                    }
                },
                { $sort: { commentsCount: -1, likesCount: -1, createdAt: -1 } },
                { $limit: 50 }
            ]);

            return res.json(drags);
        }

        const drags = await Drag.find()
            .populate('author', 'brandName username logoUrl')
            .populate('targetBrand', 'brandName username logoUrl')
            .sort(sortOption)
            .limit(50);
        res.json(drags);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Comment on a Drag (Supports Guest/Public)
const laxAuth = require('../middleware/laxAuth');
router.post('/:id/comment', laxAuth, async (req, res) => {
    try {
        const { text, guestName } = req.body;
        const drag = await Drag.findById(req.params.id);

        if (!drag) return res.status(404).json({ message: 'Drag not found' });

        let authorBrand = null;
        let displayName = guestName || 'Guest';

        if (req.brand) {
            const brand = await Brand.findById(req.brand.id);
            authorBrand = req.brand.id;
            displayName = brand ? brand.brandName : 'Brand';
        }

        const newComment = {
            text,
            author: authorBrand,
            guestName: displayName,
            isAnonymous: !req.brand,
            createdAt: new Date()
        };

        drag.comments.push(newComment);
        await drag.save();

        // Notify original author and target via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.to(`brand_${drag.author}`).emit('drag_comment', { dragId: drag._id, comment: newComment });
            if (drag.targetBrand) {
                io.to(`brand_${drag.targetBrand}`).emit('drag_comment', { dragId: drag._id, comment: newComment });
            }
        }

        res.json(drag.comments);
    } catch (err) {
        console.error("Drag Comment Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Like a Drag
router.put('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body; // Can be IP or user ID (Viewer ID)

        const drag = await Drag.findById(req.params.id);
        if (!drag) return res.status(404).json({ message: 'Drag not found' });

        // Ensure likes array exists
        if (!drag.likes) drag.likes = [];

        // Toggle like
        const index = drag.likes.indexOf(userId);
        if (index > -1) {
            drag.likes.splice(index, 1);
        } else {
            drag.likes.push(userId);
        }

        await drag.save();

        res.json(drag);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
