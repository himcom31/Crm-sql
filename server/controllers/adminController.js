const { User, Sale, Agent, Product } = require('../models'); // Sequelize models import karein
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const { Sequelize, Op } = require('sequelize');

// @desc    Create a new client & send credentials via email
exports.createClient = async (req, res) => {
    const { name, email, mobile, password, ...otherInfo } = req.body;

    try {
        // 1. Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save Client to SQL Database
        const newClient = await User.create({
            ...req.body,
            password: hashedPassword,
            role: 'client'
        });

        // 4. Send Email
        let emailStatus = "Sent Successfully";
        try {
            await sendEmail(email, password, name);
        } catch (mailErr) {
            emailStatus = "Failed to send email";
        }

        res.status(201).json({
            success: true,
            message: `Client created. Email Status: ${emailStatus}`,
            client: { id: newClient.id, name: newClient.name, email: newClient.email }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating client", error: err.message });
    }
};

// @desc    Get all clients
exports.getAllClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { role: 'client' },
            attributes: { exclude: ['password'] }, // MongoDB select('-password') ka replacement
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, count: clients.length, data: clients });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching clients" });
    }
};

// @desc    Update Client
exports.updateClient = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }

        const [updated] = await User.update(updateData, {
            where: { id: req.params.id }
        });

        if (!updated) return res.status(404).json({ success: false, message: "Client not found" });

        const updatedClient = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

        res.status(200).json({ success: true, data: updatedClient });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating client" });
    }
};

// @desc    Dashboard Analytics (Aggregation replacement in SQL)

exports.dashboard = async (req, res) => {
    try {
        // 1. Total Revenue
        const totalRevenue = await Sale.sum('totalAmount');

        // 2. Counts
        const totalAgents = await Agent.count();
        const totalClients = await User.count({ where: { role: 'client' } });

        // 3. Monthly Revenue Logic
        const monthlyRevenue = await Sale.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('investmentDate')), 'month'],
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
            ],
            group: [Sequelize.fn('MONTH', Sequelize.col('investmentDate'))],
            order: [[Sequelize.fn('MONTH', Sequelize.col('investmentDate')), 'ASC']],
            raw: true // Raw data easy handling ke liye
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // 4. Top Agents (Association Handling)
        const topAgents = await Sale.findAll({
            attributes: [
                'agentId',
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
                [Sequelize.fn('COUNT', Sequelize.col('Sale.id')), 'deals']
            ],
            include: [{ 
                model: Agent, 
                as: 'agent', // Ensure karein ki aapke model mein ye alias ho
                attributes: ['name'] 
            }],
            group: ['agentId', 'agent.id'], // Case sensitive based on DB
            order: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'DESC']],
            limit: 5
        });

        res.json({
            totalRevenue: totalRevenue || 0,
            totalAgents: totalAgents || 0,
            totalClients: totalClients || 0,
            chartData: monthlyRevenue.map(item => ({
                name: monthNames[item.month - 1] || "Unknown",
                revenue: parseFloat(item.revenue || 0)
            })),
            agents: topAgents.map(a => ({
                // Check if agent exists before accessing name
                name: a.agent ? a.agent.name : "Unknown Agent", 
                revenue: parseFloat(a.get('revenue') || 0),
                deals: parseInt(a.get('deals') || 0)
            }))
        });

    } catch (err) {
        console.error("Dashboard Controller Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Admin Profile
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Delete Client
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        // SQL destroy method
        const deleted = await User.destroy({
            where: { id: id, role: 'client' } // Protection: Sirf client delete ho sake
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        res.status(200).json({ success: true, message: "Client deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting client", error: err.message });
    }
};