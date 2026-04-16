const { sequelize } = require('../config/db');
const Admin = require('./Admin'); // User ki jagah Admin
const Client = require('./Client'); // User ki jagah Client
const Agent = require('./Agent');
const Category = require('./Category');
const Product = require('./Product');
const Sale = require('./Sale');

// --- ASSOCIATIONS (Relationships) ---

// 1. Client & Sale (Ab 'User' ki jagah 'Client' use hoga)
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'purchases' });
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// 2. Product & Sale
Product.hasMany(Sale, { foreignKey: 'productId' });
Sale.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 3. Agent & Sale
Agent.hasMany(Sale, { foreignKey: 'agentId', as: 'sales' });
Sale.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

// 4. Admin & Product (Product kis Admin ne create kiya)
// Admin.hasMany(Product, { foreignKey: 'createdBy', as: 'createdProducts' });
// Product.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });

// 5. Admin & Sale (Sale ki entry kis Admin ne ki)
Admin.hasMany(Sale, { foreignKey: 'createdBy', as: 'entries' });
Sale.belongsTo(Admin, { foreignKey: 'createdBy', as: 'entryCreator' });


Product.belongsTo(Admin, { foreignKey: 'createdBy', as: 'admin' });
Admin.hasMany(Product, { foreignKey: 'createdBy' });

module.exports = {
    sequelize,
    Admin,
    Client,
    Agent,
    Category,
    Product,
    Sale
};