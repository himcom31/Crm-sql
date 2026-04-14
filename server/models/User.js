const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Aapka database connection instance

const User = sequelize.define('User', {
    // Standard SQL Primary Key
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
            isEmail: true // SQL level validation for email format
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false // Hashed password store hoga
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Date_of_Birth: {
        type: DataTypes.DATEONLY, // Sirf date store karne ke liye (YYYY-MM-DD)
        allowNull: true
    },
    
    Pan_card_Number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Adhar_card_Number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Bank_Account_Number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    IFSC_Code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Bank_Account_Name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Bank_Branch: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('admin', 'client'),
        defaultValue: 'client',
        allowNull: false
    }
}, {
    // Timestamps default true hote hain (createdAt, updatedAt)
    timestamps: true,
    tableName: 'users'
});

module.exports = User;