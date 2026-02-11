const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Get all posts for a brand
router.get('/brand/:brandId', async (req, res) => {
    try {
        const posts = await Post.find({ brand: req.params.brandId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a post (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { content, imageUrl } = req.body;

        const newPost = new Post({
            brand: req.brand.id,
            content,
            imageUrl: imageUrl || ''
        });

        const post = await newPost.save();

        // Emit Socket.io event for real-time feed update
        req.app.get('io').emit('new_post', { brandId: req.brand.id, post });

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
    try {
        const { text, authorBrandId, guestName } = req.body; // authorBrandId is optional (if logged in)

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            text,
            isAnonymous: !authorBrandId,
            guestName: guestName || 'Anonymous',
            createdAt: new Date()
        };

        if (authorBrandId) {
            newComment.authorBrand = authorBrandId;
            newComment.isAnonymous = false;
        }

        post.comments.unshift(newComment);

        await post.save();

        // Emit Socket.io event [Optional: populate author details before emitting]
        // For efficiency, we might just emit the simple object or re-fetch.
        // Let's emit the simple object for now.
        req.app.get('io').to(`brand_${post.brand}`).emit('new_comment', { postId: post._id, comment: newComment });

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
