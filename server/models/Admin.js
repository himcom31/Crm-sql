const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'admin' // Fixed for this table
    }
}, {
    timestamps: true,
    tableName: 'admins'
});

module.exports = Admin;