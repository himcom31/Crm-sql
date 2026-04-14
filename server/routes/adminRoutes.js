const express = require('express');
const router = express.Router();

// Controllers Import (Sequelize Ready)
const { 
    createClient, 
    getAllClients, 
    updateClient, 
    deleteClient, 
    dashboard, 
    getAdminProfile 
} = require('../controllers/adminController');

const { addProduct } = require('../controllers/productController');
const { createAgent, getAllAgents, deleteAgentByEmail, updateAgent } = require("../controllers/agentController");
const { addCategory, getCategories, deleteCategory } = require("../controllers/categoryController");
const { 
    createSale, 
    getSalesHistory, 
    getExpiringSales, 
    processSettlementAndRenewal 
} = require('../controllers/saleController');

// Middlewares
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * GLOBAL MIDDLEWARE
 * Sabhi admin routes ke liye Token validation aur Admin role check zaroori hai.
 */
router.use(protect);
router.use(admin);

// --- CLIENT MANAGEMENT ROUTES ---
// SQL: createClient function User.create() use karega
router.post('/create-client', createClient);
router.get('/clients', getAllClients);
router.put('/client/:id', updateClient); 
router.delete('/client/:id', deleteClient); 

// --- PRODUCT MANAGEMENT ROUTES ---
router.post('/add-product', addProduct);

// --- AGENT MANAGEMENT ROUTES ---
router.post("/agent/form", createAgent);
router.get("/agent/all", getAllAgents);
router.delete("/agent/all/:email", deleteAgentByEmail);
router.put("/agent/update/:email", updateAgent);

// --- CATEGORY MANAGEMENT ROUTES ---
router.post("/category/form", addCategory);
router.get("/category/all", getCategories);
router.delete("/category/all/:id", deleteCategory);

// --- SALES & MATURITY TRACKER ROUTES ---
// SQL: processSettlementAndRenewal ab SQL Transactions handle karega
router.post('/sales/add', createSale);
router.get('/sales/history', getSalesHistory);
router.get('/sales/expiry', getExpiringSales);
router.post('/sales/settle-renew', processSettlementAndRenewal);

// --- ANALYTICS & PROFILE ROUTES ---
// SQL: dashboard aggregation SQL SUM/COUNT mein convert ho chuka hai
router.get("/dashboard-stats", dashboard);
router.get("/profile", getAdminProfile);

module.exports = router;