const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Aapka database connection instance

const Product = sequelize.define('Product', {
    // Standard Primary Key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // Number ke liye DECIMAL behtar hai (Precision ke liye)
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT, // Badi description ke liye TEXT use karein
        allowNull: true
    },
    Category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Mature_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Date_Mature: {
        type: DataTypes.DATE, // Date format same rahega
        allowNull: false
    },
    // SQL RELATION (Foreign Key)
    createdBy: {
        type: DataTypes.INTEGER, // User table ki Primary Key (id) ka type yahan hona chahiye
        allowNull: false,
        references: {
            model: 'admins', // Table name (plural) jisse link karna hai
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'products'
});

module.exports = Product;