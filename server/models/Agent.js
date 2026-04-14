const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Aapka db connection file

const Agent = sequelize.define('Agent', {
    // SQL mein ID auto-increment primary key default hoti hai
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // SQL level validation
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Emr_phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Office"
    },
    status: {
        type: DataTypes.ENUM("Active", "On Leave", "Inactive"),
        defaultValue: "Active"
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Agar login dena hai toh
    }
}, {
    // timestamps: true default hota hai Sequelize mein, 
    // ye createdAt aur updatedAt fields auto-manage karega
    timestamps: true,
    tableName: 'agents' // Table ka naam
});

module.exports = Agent;