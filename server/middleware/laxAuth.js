const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // If no token, just proceed
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.brand = decoded.brand;
        next();
    } catch (err) {
        // Even if token is invalid, we proceed (it just won't be a brand comment)
        next();
    }
};
