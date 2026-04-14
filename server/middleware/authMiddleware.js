const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Sequelize models import karein

const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 2. Get user from the token in SQL
            // MongoDB: User.findById(decoded.id).select('-password')
            // SQL (Sequelize): findByPk with attributes exclude
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // Return zaroor lagayein taaki double response na jaye
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Only for Admin check (Logic same rehta hai)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };