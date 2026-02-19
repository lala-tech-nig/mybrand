// Middleware to track unique views using cookies
// Prevents duplicate view counts on page refresh

const trackView = (req, res, next) => {
    // This middleware will be used in public routes to track unique views
    // It sets a cookie to prevent counting the same visitor multiple times within 24 hours

    const brandId = req.brandId; // Set by route handler
    if (!brandId) return next();

    const cookieName = `viewed_brand_${brandId}`;
    const hasViewed = req.cookies[cookieName];

    if (!hasViewed) {
        // Mark as viewed for 24 hours
        res.cookie(cookieName, 'true', {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true,
            sameSite: 'lax'
        });
        req.shouldIncrementView = true;
    } else {
        req.shouldIncrementView = false;
    }

    next();
};

module.exports = trackView;
