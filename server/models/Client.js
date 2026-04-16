const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Client = sequelize.define('Client', {
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
    mobile: { type: DataTypes.STRING },
    Date_of_Birth: { type: DataTypes.DATEONLY },
    Pan_card_Number: { type: DataTypes.STRING },
    Adhar_card_Number: { type: DataTypes.STRING },
    Bank_Account_Number: { type: DataTypes.STRING },
    IFSC_Code: { type: DataTypes.STRING },
    Bank_Account_Name: { type: DataTypes.STRING },
    Bank_Branch: { type: DataTypes.STRING },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'client' // Fixed for this table
    }
}, {
    timestamps: true,
    tableName: 'clients'
});

module.exports = Client;