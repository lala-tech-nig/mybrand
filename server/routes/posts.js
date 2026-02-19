const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const laxAuth = require('../middleware/laxAuth');
const Post = require('../models/Post');
const Brand = require('../models/Brand');

// Get all posts for a brand
router.get('/brand/:brandId', async (req, res) => {
    try {
        const posts = await Post.find({ brand: req.params.brandId })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error("Get Brand Posts Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Create a post (Protected)
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { content } = req.body;

        let imageUrl = '';
        if (req.file) {
            imageUrl = req.file.path; // Cloudinary URL
        }

        const newPost = new Post({
            brand: req.brand.id,
            content,
            imageUrl
        });

        const post = await newPost.save();

        // Badge Logic: Frequent Poster
        const postCount = await Post.countDocuments({ brand: req.brand.id });
        if (postCount >= 5) {
            const brand = await Brand.findById(req.brand.id);
            if (!brand.badges.includes('Frequent Poster')) {
                brand.badges.push('Frequent Poster');
                brand.engagementScore = (brand.engagementScore || 0) + 50;
                await brand.save();
            }
        }

        // Emit Socket.io event for real-time feed update
        req.app.get('io').emit('new_post', { brandId: req.brand.id, post });

        res.json(post);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Like a post
router.put('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body; // Can be IP or user ID

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Toggle like
        const index = post.likes.indexOf(userId);
        if (index > -1) {
            post.likes.splice(index, 1);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        // Emit Socket.io event
        req.app.get('io').to(`brand_${post.brand}`).emit('post_liked', { postId: post._id, likes: post.likes.length });

        res.json(post);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Add a comment to a post (Supports Guest/Public)
router.post('/:id/comment', laxAuth, async (req, res) => {
    try {
        const { text, guestName } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        let authorBrand = null;
        let displayName = guestName || 'Guest';

        if (req.brand) {
            const brand = await Brand.findById(req.brand.id);
            authorBrand = req.brand.id;
            displayName = brand ? brand.brandName : 'Brand';
        }

        const newComment = {
            text,
            authorBrand,
            guestName: displayName,
            isAnonymous: !req.brand,
            createdAt: new Date()
        };

        post.comments.unshift(newComment);

        try {
            await post.save();
        } catch (saveErr) {
            console.error("Mongoose Save Error (Comment):", saveErr);
            return res.status(400).json({ message: "Failed to save comment", error: saveErr.message });
        }

        // Emit Socket.io event with safety check
        const io = req.app.get('io');
        if (io) {
            io.to(`brand_${post.brand.toString()}`).emit('new_comment', { postId: post._id, comment: newComment });
        }

        res.json(post.comments);
    } catch (err) {
        console.error("Internal Server Error (Add Comment):", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Delete a post (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.brand.toString() !== req.brand.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post removed' });
    } catch (err) {
        console.error("Delete Post Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});


// Update a post visibility (Protected)
router.put('/:id/visibility', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.brand.toString() !== req.brand.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        post.isHidden = !post.isHidden;
        await post.save();

        res.json(post);
    } catch (err) {
        console.error("Visibility Toggle Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Update a post (Protected)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.brand.toString() !== req.brand.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { content } = req.body;
        if (content) post.content = content;

        if (req.file) {
            post.imageUrl = req.file.path;
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Reply to a comment (Supports Guest/Public)
router.post('/:id/comment/:commentId/reply', laxAuth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Reply text is required" });
        }
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        let authorBrand = null;
        let displayName = req.body.guestName || 'Guest';

        if (req.brand) {
            const brand = await Brand.findById(req.brand.id);
            authorBrand = req.brand.id;
            displayName = brand ? brand.brandName : 'Brand';
        }

        const newReply = {
            text,
            authorBrand,
            guestName: displayName,
            createdAt: new Date()
        };

        comment.replies.push(newReply);

        try {
            await post.save();
        } catch (saveErr) {
            console.error("Mongoose Save Error (Reply):", saveErr);
            return res.status(400).json({ message: "Failed to save reply", error: saveErr.message });
        }

        res.json(post.comments);
    } catch (err) {
        console.error("Internal Server Error (Reply):", err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

module.exports = router;
