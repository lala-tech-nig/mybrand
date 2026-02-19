const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Search brands
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const brands = await Brand.find({
            $or: [
                { brandName: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        }).select('brandName username logoUrl _id isVerified statusGem').limit(5);

        res.json(brands);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Brand by Subdomain (Username)
router.get('/:username', async (req, res) => {
    try {
        const brand = await Brand.findOne({ username: req.params.username }).select('-password');
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const products = await Product.find({ brand: brand._id }).sort({ createdAt: -1 });
        const posts = await Post.find({ brand: brand._id }).sort({ createdAt: -1 });

        res.json({ brand, products, posts });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Brand Settings
router.put('/settings', auth, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'coverImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const { themeColor, description, fullName, brandName } = req.body;

        let brand = await Brand.findById(req.brand.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        if (themeColor) brand.themeColor = themeColor;
        if (description) brand.description = description;
        if (fullName) brand.fullName = fullName;
        if (brandName) brand.brandName = brandName;

        if (req.files) {
            if (req.files['logo']) {
                brand.logoUrl = req.files['logo'][0].path;
            }
            if (req.files['cover']) {
                brand.coverUrl = req.files['cover'][0].path;
            }
            if (req.files['coverImages'] && brand.tier === 'Premium') {
                brand.coverImages = req.files['coverImages'].map(f => f.path);
            }
        }

        await brand.save();
        res.json(brand);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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

// Upgrade to Premium
router.put('/upgrade', auth, async (req, res) => {
    try {
        const { duration, transaction_id } = req.body; // duration: 'monthly'|'yearly'

        if (!transaction_id) return res.status(400).json({ message: 'Payment transaction ID required' });

        const price = duration === 'yearly' ? 19200 : 2000; // 2000 * 12 * 0.8 = 19200
        const isValid = await verifyPayment(transaction_id, price);

        if (!isValid) return res.status(400).json({ message: 'Payment verification failed' });

        let brand = await Brand.findById(req.brand.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        const now = new Date();
        const endDate = new Date(now);

        if (duration === 'yearly') {
            endDate.setFullYear(now.getFullYear() + 1);
        } else {
            endDate.setDate(now.getDate() + 30);
        }

        brand.tier = 'Premium';
        brand.isVerified = true;
        brand.subscription = {
            status: 'Active',
            startDate: now,
            endDate,
            lastPaymentDate: now
        };

        await brand.save();
        res.json({ message: 'Upgraded to Premium successfully', brand });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Purchase/Upgrade Status Gem (Premium only)
const GEM_PRICES = {
    Bronze: { monthly: 500, yearly: 4800 },
    Silver: { monthly: 1000, yearly: 9600 },
    Gold: { monthly: 2000, yearly: 19200 },
    Diamond: { monthly: 5000, yearly: 48000 }
};

router.put('/gem', auth, async (req, res) => {
    try {
        const { gem, duration, transaction_id } = req.body; // gem: 'Bronze'|'Silver'|'Gold'|'Diamond', duration: 'monthly'|'yearly'

        if (!transaction_id) return res.status(400).json({ message: 'Payment transaction ID required' });

        let brand = await Brand.findById(req.brand.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        if (brand.tier !== 'Premium') {
            return res.status(403).json({ message: 'Status Gems are a Premium feature. Please upgrade to Premium first.' });
        }

        if (!GEM_PRICES[gem]) {
            return res.status(400).json({ message: 'Invalid gem type' });
        }

        const price = duration === 'yearly' ? GEM_PRICES[gem].yearly : GEM_PRICES[gem].monthly;
        const isValid = await verifyPayment(transaction_id, price);

        if (!isValid) return res.status(400).json({ message: 'Payment verification failed' });

        const now = new Date();
        const expiry = new Date(now);
        if (duration === 'yearly') {
            expiry.setFullYear(now.getFullYear() + 1);
        } else {
            expiry.setDate(now.getDate() + 30);
        }

        brand.statusGem = gem;
        brand.gemExpiry = expiry;

        await brand.save();
        res.json({ message: `${gem} gem activated!`, brand });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Follow a Brand
router.post('/follow/:id', auth, async (req, res) => {
    try {
        const brandToFollow = await Brand.findById(req.params.id);
        const currentBrand = await Brand.findById(req.brand.id);

        if (!brandToFollow || !currentBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        if (brandToFollow.followers.includes(req.brand.id)) {
            return res.status(400).json({ message: 'Already following' });
        }

        brandToFollow.followers.push(req.brand.id);
        currentBrand.following.push(req.params.id);

        await brandToFollow.save();
        await currentBrand.save();

        req.app.get('io').to(`brand_${brandToFollow._id}`).emit('new_follower', {
            followerName: currentBrand.brandName,
            followerId: currentBrand._id
        });

        res.json(brandToFollow.followers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Unfollow a Brand
router.post('/unfollow/:id', auth, async (req, res) => {
    try {
        const brandToUnfollow = await Brand.findById(req.params.id);
        const currentBrand = await Brand.findById(req.brand.id);

        if (!brandToUnfollow || !currentBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        brandToUnfollow.followers = brandToUnfollow.followers.filter(id => id.toString() !== req.brand.id);
        currentBrand.following = currentBrand.following.filter(id => id.toString() !== req.params.id);

        await brandToUnfollow.save();
        await currentBrand.save();

        res.json(brandToUnfollow.followers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
