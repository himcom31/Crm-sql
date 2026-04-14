const { Agent } = require('../models'); // Sequelize models import karein
const bcrypt = require('bcryptjs');

// ✅ 1. Create Agent (POST /api/admin/agent/form)
exports.createAgent = async (req, res) => {
  try {
    const { name, email, phone, role, status, Emr_phone } = req.body;

    // Check duplicate using SQL 'where' clause
    const exists = await Agent.findOne({ where: { email: email } });
    if (exists) {
      return res.status(400).json({ message: "Agent already exists with this email" });
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash("Agent@123", 10);

    // SQL create method
    const newAgent = await Agent.create({
      name,
      email,
      phone,
      role,
      status,
      Emr_phone,
      password: hashedPassword // Ensure your SQL model has a password field
    });

    res.status(201).json({ message: "Agent added to CRM", agent: newAgent });
  } catch (error) {
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

// ✅ 2. Get All Agents (GET /api/admin/agent/form)
exports.getAllAgents = async (req, res) => {
  try {
    // SQL 'findAll' with sorting
    const agents = await Agent.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agents", error: error.message });
  }
};

// ✅ 3. Delete Agent by Email (DELETE /api/admin/agent/form/:email)
exports.deleteAgentByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // SQL 'destroy' method with where clause
    const deletedCount = await Agent.destroy({
      where: { email: email }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Is email ka koi agent nahi mila!" });
    }

    res.json({ message: `Agent with email ${email} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Delete karne mein error aayi", error: error.message });
  }
};

// ✅ 4. Update Agent (PUT /api/admin/agent/form/:email)
exports.updateAgent = async (req, res) => {
  try {
    const { email } = req.params;
    const updateData = req.body;

    // SQL 'update' method
    // Note: 'update' returns an array [rowsUpdated]
    const [updatedCount] = await Agent.update(updateData, {
      where: { email: email }
    });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Agent nahi mila ya data same hai!" });
    }

    // Updated data fetch karne ke liye
    const updatedAgent = await Agent.findOne({ where: { email: email } });

    res.json({ message: "Agent details updated successfully", agent: updatedAgent });
  } catch (error) {
    res.status(500).json({ message: "Update karne mein error aayi", error: error.message });
  }
};