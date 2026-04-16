const jwt = require('jsonwebtoken');
const { Admin, Client } = require('../models'); // Sahi models import karein

const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 2. Role ke hisaab se sahi table mein user dhundhein
            // decoded.role humne login controller mein token mein dala tha
            if (decoded.role === 'admin') {
                req.user = await Admin.findByPk(decoded.id, {
                    attributes: { exclude: ['password'] }
                });
            } else if (decoded.role === 'client') {
                req.user = await Client.findByPk(decoded.id, {
                    attributes: { exclude: ['password'] }
                });
            }

            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists in the system' });
            }

            // Request object mein role bhi set kar dein taaki aage use ho sake
            req.userRole = decoded.role; 

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Only for Admin check
const admin = (req, res, next) => {
    // Ab check karein ki req.user 'Admin' table se aaya hai ya nahi
    if (req.user && req.userRole === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };