const express = require('express');
const cors = require('cors');
require('dotenv').config();

// SQL Connection aur Models Import
// Note: ./models/index.js mein associations define honi chahiye
const { connectDB, sequelize } = require('./config/db.js'); 
const models = require('./models/index.js'); 

const app = express();

/**
 * DATABASE SYNC LOGIC
 * Sequelize models ko database tables ke saath sync karta hai.
 */
const startServer = async () => {
    try {
        // 1. Database Connect karein
        await connectDB();

        // 2. Tables Sync karein
        // { alter: true } use karne se models ke changes table mein update ho jate hain
        // Production mein isse false ya migrations use karein
        await sequelize.sync({ alter: false });
        console.log("All SQL Tables synced successfully.");

        // 3. Middlewares
        app.use(cors());
        app.use(express.json());

        // 4. Routes (Controllers already SQL mein convert ho chuke hain)
        app.use('/api/auth', require('./routes/authRoutes.js'));
        app.use('/api/admin', require('./routes/adminRoutes.js'));
        app.use('/api/products', require('./routes/productRoutes.js'));
        app.use('/api/client', require('./routes/clientRoutes.js'));

        // 5. Start Listening
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 SQL Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

// Start the engine
startServer();