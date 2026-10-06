const prisma = require('../db/prisma');

const getAllPurchaseOrders = async () => {
    return await prisma.purchase_orders.findMany({
        include: {
            suppliers: true,
            branch: true,
            users: true,
            purchase_order_items: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

const getPurchaseOrderById = async (orderID) => {
    return await prisma.purchase_orders.findUnique({
        where: {
            orderID: orderID
        },
        include: {
            suppliers: true,
            branch: true,
            users: true,
            purchase_order_items: true
        }
    });
};

const createPurchaseOrder = async (data) => {
    return await prisma.purchase_orders.create({
        data: {
            supplierID: data.supplierID,
            branchID: data.branchID,
            requestID: data.requestID || null,
            status: data.status || 'open',
            created_by: data.created_by
        },
        include: {
            suppliers: true,
            branch: true,
            users: true,
            purchase_order_items: true
        }
    });
};

const updatePurchaseOrder = async (orderID, data) => {
    return await prisma.purchase_orders.update({
        where: {
            orderID: orderID
        },
        data: {
            supplierID: data.supplierID,
            branchID: data.branchID,
            requestID: data.requestID || null,
            status: data.status
        },
        include: {
            suppliers: true,
            branch: true,
            users: true,
            purchase_order_items: true
        }
    });
};

const deletePurchaseOrder = async (orderID) => {
    return await prisma.purchase_orders.delete({
        where: {
            orderID: orderID
        }
    });
};

module.exports = {
    getAllPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
};