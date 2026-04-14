const { User } = require('../models'); // Sequelize models
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // 1. Check user exists with specific role in SQL
        // MongoDB: User.findOne({ email, role })
        const user = await User.findOne({ 
            where: { 
                email: email, 
                role: role 
            } 
        });

        if (!user) {
            return res.status(404).json({ message: "User not found with this role" });
        }

        // 2. Compare Password (Same as before)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Generate JWT Token
        // SQL mein default ID field 'id' hoti hai (MongoDB mein '_id')
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile
            }
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};