//const { User } = require('../models'); // Sequelize models
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Common Token Generator
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// ==========================
// ADMIN LOGIN (Queries 'admins' table)
// ==========================
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(404).json({ message: "Admin account not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(admin.id, 'admin');
        res.status(200).json({
            token,
            user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ==========================
// CLIENT LOGIN (Queries 'clients' table)
// ==========================
exports.clientLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const client = await Client.findOne({ where: { email } });

        if (!client) {
            return res.status(404).json({ message: "Client account not found" });
        }

        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(client.id, 'client');
        res.status(200).json({
            token,
            user: { 
                id: client.id, 
                name: client.name, 
                email: client.email, 
                role: 'client',
                mobile: client.mobile 
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};