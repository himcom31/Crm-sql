const { Product } = require('../models'); // Sequelize models import karein
const { Op } = require('sequelize');

// ✅ 1. Add Product (POST)
exports.addProduct = async (req, res) => {
    // 1. Destructure data from body
    const { name, price, description, Category, Mature_Amount, Date_Mature } = req.body;

    try {
        // 2. SQL 'create' method
        const newProduct = await Product.create({ 
            name, 
            price, 
            description, 
            Category,
            Mature_Amount,
            Date_Mature,
            // SQL mein default primary key 'id' hoti hai
            createdBy: req.user.id 
        });

        // 3. Send Response
        res.status(201).json(newProduct);
    } catch (err) {
        console.log("Add Product Error:", err); 
        res.status(500).json({ message: "Error adding product", error: err.message });
    }
};

// ✅ 2. Get All Products (GET)
exports.getProducts = async (req, res) => {
    try {
        // SQL 'findAll' with sorting (Newest first)
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products", error: err.message });
    }
};

// ✅ 3. Update Product (PUT)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // SQL 'update' method returns an array [affectedCount]
        const [updatedCount] = await Product.update(req.body, {
            where: { id: id }
        });

        if (updatedCount === 0) {
            return res.status(404).json({ message: "Product not found or no changes made" });
        }

        // Updated data fetch karne ke liye
        const updatedProduct = await Product.findByPk(id);
        res.status(200).json(updatedProduct);

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Error updating product", error: err.message });
    }
};

// ✅ 4. Delete Product (DELETE)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // SQL 'destroy' method
        const deletedCount = await Product.destroy({
            where: { id: id }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err.message });
    }
};