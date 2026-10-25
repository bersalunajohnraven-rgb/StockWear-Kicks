const purchaseOrderService = require('../services/purchaseOrderService');

const getAllPurchaseOrders = async (req, res) => {
    try {
        const orders = await purchaseOrderService.getAllPurchaseOrders();

        res.status(200).json(orders);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve purchase orders'
        });
    }
};

const getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await purchaseOrderService.getPurchaseOrderById(id);

        if (!order) {
            return res.status(404).json({
                message: 'Purchase order not found'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve purchase order'
        });
    }
};

const createPurchaseOrder = async (req, res) => {
    try {
        const {
            supplierID,
            branchID,
            requestID,
            status,
            created_by
        } = req.body;

        if (!supplierID || !branchID || !created_by) {
            return res.status(400).json({
                message: 'supplierID, branchID, and created_by are required'
            });
        }

        const order = await purchaseOrderService.createPurchaseOrder({
            supplierID,
            branchID,
            requestID,
            status,
            created_by
        }, req.user?.userID);

        res.status(201).json(order);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create purchase order'
        });
    }
};

const updatePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            supplierID,
            branchID,
            requestID,
            status
        } = req.body;

        const order = await purchaseOrderService.updatePurchaseOrder(id, {
            supplierID,
            branchID,
            requestID,
            status
        }, req.user?.userID);

        res.status(200).json(order);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update purchase order'
        });
    }
};

const deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await purchaseOrderService.deletePurchaseOrder(id, req.user?.userID);

        res.status(200).json({
            message: 'Purchase order deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete purchase order'
        });
    }
};

module.exports = {
    getAllPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
};