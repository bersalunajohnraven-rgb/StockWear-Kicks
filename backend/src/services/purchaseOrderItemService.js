const prisma = require('../db/prisma');

const getAllPurchaseOrderItems = async () => {
    return await prisma.purchase_order_items.findMany({
        include: {
            products: true,
            purchase_orders: true
        }
    });
};

const getPurchaseOrderItemById = async (id) => {
    return await prisma.purchase_order_items.findUnique({
        where: {
            purchase_itemID: id
        },
        include: {
            products: true,
            purchase_orders: true
        }
    });
};

const createPurchaseOrderItem = async (data) => {
    return await prisma.purchase_order_items.create({
        data: {
            orderID: data.orderID,
            productID: data.productID,
            quantity_ordered: Number(data.quantity_ordered),
            unit_cost: data.unit_cost
        },
        include: {
            products: true,
            purchase_orders: true
        }
    });
};

const updatePurchaseOrderItem = async (id, data) => {
    return await prisma.purchase_order_items.update({
        where: {
            purchase_itemID: id
        },
        data: {
            quantity_ordered: data.quantity_ordered !== undefined
                ? Number(data.quantity_ordered)
                : undefined,
            unit_cost: data.unit_cost !== undefined
                ? data.unit_cost
                : undefined
        },
        include: {
            products: true,
            purchase_orders: true
        }
    });
};

const deletePurchaseOrderItem = async (id) => {
    return await prisma.purchase_order_items.delete({
        where: {
            purchase_itemID: id
        }
    });
};

module.exports = {
    getAllPurchaseOrderItems,
    getPurchaseOrderItemById,
    createPurchaseOrderItem,
    updatePurchaseOrderItem,
    deletePurchaseOrderItem
};