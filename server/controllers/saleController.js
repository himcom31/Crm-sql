const { Sale, Product, Client, Agent, sequelize } = require('../models'); // User ko Client se replace kiya
const { Op } = require('sequelize');
const moment = require('moment');

// ✅ 1. CREATE SALE (Fresh Purchase)
exports.createSale = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { clientId, productIds, investmentDate, agentId, commissionLabel } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "At least one product must be selected" });
        }

        const salesRecords = [];

        for (let productId of productIds) {
            const productData = await Product.findByPk(productId);
            if (!productData) continue;

            const calculatedCommission = (productData.price * commissionLabel) / 100;

            const newSale = await Sale.create({
                clientId,
                productId,
                agentId,
                investmentDate: investmentDate || new Date(),
                commissionPercentage: commissionLabel,
                commissionAmount: calculatedCommission,
                totalAmount: productData.price,
                paidAmount: productData.price, 
                pendingAmount: 0,
                createdBy: req.user.id // Ye req.user ab Admin model se aayega (Auth middleware check karein)
            }, { transaction });

            salesRecords.push(newSale);
        }

        await transaction.commit();
        res.status(201).json({ success: true, message: `${salesRecords.length} sales recorded`, data: salesRecords });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ 2. SALES HISTORY (With Joins)
exports.getSalesHistory = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [
                // User ki jagah Client model
                { model: Client, as: 'client', attributes: ['name', 'email'] }, 
                { model: Product, attributes: ['name', 'price'] },
                { model: Agent, as: 'agent', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history", error: error.message });
    }
};

// ✅ 3. GET EXPIRING SALES (Tracker Logic)
exports.getExpiringSales = async (req, res) => {
    try {
        const { filterType, customDate } = req.query;
        let end = moment().endOf('day');

        if (filterType === 'custom' && customDate) {
            end = moment(customDate).endOf('day');
        } else if (filterType === 'month') {
            end = moment().endOf('month');
        }

        const expiringSales = await Sale.findAll({
            include: [
                // User ki jagah Client model
                { model: Client, as: 'client', attributes: ['id', 'name', 'email'] }, 
                { model: Agent, as: 'agent', attributes: ['id', 'name'] },
                { 
                    model: Product, 
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'Date_Mature'],
                    where: { Date_Mature: { [Op.lte]: end.toDate() } } 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: expiringSales.length,
            uptoDate: end.format('YYYY-MM-DD'),
            data: expiringSales
        });
    } catch (error) {
        console.error("Expiry Fetch Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ 4. PROCESS SETTLEMENT AND RENEWAL
exports.processSettlementAndRenewal = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { 
            saleId, clientId, productIds, agentId, 
            commissionLabel, paymentType, paidAmount, isRenewal 
        } = req.body;

        if (!clientId || !productIds || productIds.length === 0) {
            return res.status(400).json({ success: false, message: "Missing Client or Products" });
        }

        if (saleId) {
            const oldSale = await Sale.findByPk(saleId);
            if (oldSale) {
                const isFull = paymentType === 'Full';
                await oldSale.update({
                    paymentType,
                    paidAmount: isFull ? oldSale.totalAmount : paidAmount,
                    pendingAmount: isFull ? 0 : (oldSale.totalAmount - paidAmount),
                    isExpired: isFull
                }, { transaction });
            }
        }

        const processedSales = [];
        for (let pid of productIds) {
            const productData = await Product.findByPk(pid);
            if (!productData) continue;

            const total = productData.price;
            const currentPaid = paymentType === 'Full' ? total : Number(paidAmount);
            const balance = total - currentPaid;
            const commission = (total * (commissionLabel || 5)) / 100;

            const newSale = await Sale.create({
                clientId,
                productId: pid,
                agentId,
                investmentDate: new Date(),
                totalAmount: total,
                paidAmount: currentPaid,
                pendingAmount: balance > 0 ? balance : 0,
                paymentType: paymentType,
                commissionPercentage: commissionLabel || 5,
                commissionAmount: commission,
                isRenewal: isRenewal || false,
                createdBy: req.user.id
            }, { transaction });

            processedSales.push(newSale);

            if (isRenewal) {
                const currentMaturity = productData.Date_Mature || new Date();
                await productData.update({
                    Date_Mature: moment(currentMaturity).add(1, 'year').toDate()
                }, { transaction });
            }
        }

        await transaction.commit();
        res.status(201).json({ success: true, message: "Process Completed", data: processedSales });

    } catch (error) {
        await transaction.rollback();
        console.error("SQL TRANSACTION ERROR:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};