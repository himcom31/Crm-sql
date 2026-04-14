const { Category } = require("../models"); // Sequelize models import karein

// ✅ 1. Add Category (POST)
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // SQL 'findOne' with where clause
    const exists = await Category.findOne({ where: { name: name } });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // SQL 'create' method
    const newCat = await Category.create({ name, description });
    
    res.status(201).json(newCat);
  } catch (err) {
    console.error("Add Category Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ 2. Get All Categories (GET)
exports.getCategories = async (req, res) => {
  try {
    // SQL 'findAll' with sorting (Ascending order)
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// ✅ 3. Delete Category (DELETE)
exports.deleteCategory = async (req, res) => {
  try {
    // Note: Agar aap name se delete kar rahe hain toh 'destroy' with where clause
    const deletedCount = await Category.destroy({
      where: { name: req.params.id } 
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Delete failed server error", error: err.message });
  }
};