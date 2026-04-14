const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Aapka database connection instance

const Category = sequelize.define('Category', {
    // SQL Primary Key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Database level par duplicate names ko rokega
        validate: {
            notEmpty: true // Khali string allow nahi karega
        }
    },
    description: {
        type: DataTypes.TEXT, // Agar description bada ho toh STRING ki jagah TEXT behtar hai
        allowNull: true
    }
}, {
    // Timestamps (createdAt, updatedAt) Sequelize mein default true hote hain
    timestamps: true,
    tableName: 'categories' // Table ka naam plural mein rakhna standard hai
});

module.exports = Category;