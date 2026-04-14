const { sequelize } = require('../config/db');
const User = require('./User');
const Agent = require('./Agent');
const Category = require('./Category');
const Product = require('./Product');
const Sale = require('./Sale');

// --- ASSOCIATIONS (Relationships) ---

// 1. User & Sale (Client Purchase)
User.hasMany(Sale, { foreignKey: 'clientId', as: 'purchases' });
Sale.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// 2. Product & Sale
Product.hasMany(Sale, { foreignKey: 'productId' });
Sale.belongsTo(Product, { foreignKey: 'productId' });

// 3. Agent & Sale
// Agent.hasMany(Sale, { foreignKey: 'agentId' });
// Sale.belongsTo(Agent, { foreignKey: 'agentId' });
// 3. Agent & Sale
Agent.hasMany(Sale, { foreignKey: 'agentId', as: 'sales' }); // as add kiya
Sale.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' }); // yahan 'as: agent' bahut zaroori hai

// 4. Admin (User) & Product (Created By)
User.hasMany(Product, { foreignKey: 'createdBy' });
Sale.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 5. Admin (User) & Sale (Entry By)
User.hasMany(Sale, { foreignKey: 'createdBy', as: 'entries' });
Sale.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
    sequelize,
    User,
    Agent,
    Category,
    Product,
    Sale
};