const { Sequelize } = require('sequelize');
require('dotenv').config();

// SQL Connection Configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,     
    process.env.DB_USER,     
    process.env.DB_PASS,     // <-- Fix: Yahan DB_PASS karein (.env se match karne ke liye)
    {
        host: process.env.DB_HOST, 
        port: process.env.DB_PORT || 28543, // <-- Fix: Port zaroori hai
        dialect: 'mysql',          
        logging: false,            
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // <-- Cloud connection ke liye mandatory hai
            }
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        
        // Note: Sync yahan se hata kar server.js mein rakhna behtar hai, 
        // par yahan bhi kaam karega.
        await sequelize.sync({ alter: false }); 
        
        console.log("✅ Aiven Cloud MySQL Connected & Synced!");
    } catch (err) {
        console.error("❌ SQL Connection Error: ", err.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };