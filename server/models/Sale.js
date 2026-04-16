const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // --- FOREIGN KEYS (Relationships) ---
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clients', // Table name for Clients
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products', // Table name for Products
            key: 'id'
        }
    },
    agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'agents', // Table name for Agents
            key: 'id'
        }
    },
    // --- DATA FIELDS ---
    investmentDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    commissionPercentage: {
        type: DataTypes.DECIMAL(5, 2), // e.g., 10.50%
        allowNull: false
    },
    commissionAmount: {
        type: DataTypes.DECIMAL(15, 2), // Badi amounts ke liye 15 digits
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    // Naya field jo humne Tracker logic mein add kiya tha
    paidAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    pendingAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    paymentType: {
        type: DataTypes.ENUM('Full', 'Partial'),
        defaultValue: 'Full'
    },
    isRenewal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isExpired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'admins', // Admin ID
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'sales'
});

module.exports = Sale;