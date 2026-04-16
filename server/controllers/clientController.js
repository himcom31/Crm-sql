const { Sale, Client, Product, Agent } = require('../models'); // User ko Client se replace kiya
const { Sequelize, Op } = require('sequelize');

exports.getClientPurchases = async (req, res) => {
    try {
        const clientId = req.user.id;

        // SQL 'findAll' with Joins (Include)
        const purchases = await Sale.findAll({
            where: { clientId: clientId },
            include: [
                {
                    model: Product,
                    as: 'product', 
                    attributes: ['name', 'Date_Mature']
                },
                {
                    model: Agent,
                    as: 'agent', 
                    attributes: ['name']
                }
            ],
            attributes: [
                'id',
                'totalAmount',
                'paidAmount',
                'pendingAmount',
                'investmentDate',
                'isExpired',
                // STATUS LOGIC using SQL CASE
                [
                    Sequelize.literal(`
                        CASE 
                            WHEN isExpired = true THEN 'Deactivated'
                            WHEN \`product\`.\`Date_Mature\` > NOW() THEN 'Active'
                            ELSE 'Expired'
                        END
                    `), 
                    'status'
                ],
                // Aliases
                [Sequelize.col('product.Date_Mature'), 'expiryDate'],
                [Sequelize.col('product.name'), 'productName'],
                [Sequelize.col('agent.name'), 'agentName']
            ],
            order: [['investmentDate', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases
        });

    } catch (err) {
        console.error("Fetch Purchases Error:", err.message);
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

exports.getClientProfile = async (req, res) => {
    try {
        // Ab hum 'Client' model ka use karenge na ki User ka
        const client = await Client.findByPk(req.user.id, {
            attributes: { exclude: ['password'] } 
        });
        
        if (!client) {
            return res.status(404).json({ success: false, message: "Client profile not found" });
        }

        res.status(200).json({ success: true, data: client });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};