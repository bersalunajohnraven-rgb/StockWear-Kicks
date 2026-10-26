const prisma = require('../db/prisma');

const getAllInventory = async () => {
    return await prisma.inventory.findMany({
        include: {
            products: true,
            branch: true
        },
        orderBy: {
            updated_at: 'desc'
        }
    });
};

const getInventoryById = async (inventoryID) => {
    return await prisma.inventory.findUnique({
        where: {
            inventoryID: inventoryID
        },
        include: {
            products: true,
            branch: true
        }
    });
};

const createInventory = async (data) => {
    return await prisma.inventory.create({
        data: {
            productID: data.productID,
            branchID: data.branchID,
            quantity: data.quantity ?? 0,
            reorder_threshold: data.reorder_threshold ?? 0
        },
        include: {
            products: true,
            branch: true
        }
    });
};

const updateInventory = async (inventoryID, data) => {
    const updateData = {};
    if (data.productID !== undefined) updateData.productID = data.productID;
    if (data.branchID !== undefined) updateData.branchID = data.branchID;
    if (data.quantity !== undefined) updateData.quantity = Number(data.quantity);
    if (data.reorder_threshold !== undefined) updateData.reorder_threshold = Number(data.reorder_threshold);

    return await prisma.inventory.update({
        where: {
            inventoryID: inventoryID
        },
        data: updateData,
        include: {
            products: true,
            branch: true
        }
    });
};

const deleteInventory = async (inventoryID) => {
    return await prisma.inventory.delete({
        where: {
            inventoryID: inventoryID
        }
    });
};

module.exports = {
    getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory
};