const { Admin, Client, Sale, Agent, Product } = require('../models'); // Sahi models import karein
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const { Sequelize, Op } = require('sequelize');

// @desc    Create a new client & send credentials via email
exports.createClient = async (req, res) => {
    const { name, email, mobile, password, ...otherInfo } = req.body;

    try {
        // 1. Check if client already exists in Client table
        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) {
            return res.status(400).json({ success: false, message: "Email already registered as Client" });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to 'Client' Database (Ab 'User' nahi 'Client' table use hogi)
        const newClient = await Client.create({
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
        console.error("Create Client Error:", err);
        res.status(500).json({ success: false, message: "Error creating client", error: err.message });
    }
};

// @desc    Get all clients
exports.getAllClients = async (req, res) => {
    try {
        // Ab Client model se data laayenge
        const clients = await Client.findAll({
            attributes: { exclude: ['password'] }, 
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

        // 'Client' table update karein
        const [updated] = await Client.update(updateData, {
            where: { id: req.params.id }
        });

        if (!updated) return res.status(404).json({ success: false, message: "Client not found" });

        const updatedClient = await Client.findByPk(req.params.id, { attributes: { exclude: ['password'] } });

        res.status(200).json({ success: true, data: updatedClient });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating client" });
    }
};

// @desc    Dashboard Analytics
exports.dashboard = async (req, res) => {
    try {
        const totalRevenue = await Sale.sum('totalAmount');
        const totalAgents = await Agent.count();
        
        // Count from 'Client' table instead of User
        const totalClients = await Client.count(); 

        const monthlyRevenue = await Sale.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('investmentDate')), 'month'],
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
            ],
            group: [Sequelize.fn('MONTH', Sequelize.col('investmentDate'))],
            order: [[Sequelize.fn('MONTH', Sequelize.col('investmentDate')), 'ASC']],
            raw: true 
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const topAgents = await Sale.findAll({
            attributes: [
                'agentId',
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
                [Sequelize.fn('COUNT', Sequelize.col('Sale.id')), 'deals']
            ],
            include: [{ 
                model: Agent, 
                as: 'agent', 
                attributes: ['name'] 
            }],
            group: ['agentId', 'agent.id'],
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
        // Ab 'Admin' table mein check karein
        const admin = await Admin.findByPk(req.user.id, {
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

        // 'Client' table se delete karein
        const deleted = await Client.destroy({
            where: { id: id } 
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        res.status(200).json({ success: true, message: "Client deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting client", error: err.message });
    }
};