const prisma = require('../db/prisma');

const getAllStockMovements = async () => {
    return await prisma.stock_movements.findMany({
        include: {
            products: true,
            branch: true,
            users: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

const getStockMovementById = async (movementID) => {
    return await prisma.stock_movements.findUnique({
        where: {
            movementID
        },
        include: {
            products: true,
            branch: true,
            users: true
        }
    });
};

const createStockMovement = async (data) => {
    return await prisma.stock_movements.create({
        data: {
            productID: data.productID,
            branchID: data.branchID,
            change_qty: Number(data.change_qty),
            reference_id: data.reference_id || null,
            reason: data.reason,
            actor_id: data.actor_id || null
        },
        include: {
            products: true,
            branch: true,
            users: true
        }
    });
};

const updateStockMovement = async (movementID, data) => {
    return await prisma.stock_movements.update({
        where: {
            movementID
        },
        data: {
            productID: data.productID,
            branchID: data.branchID,
            change_qty: Number(data.change_qty),
            reference_id: data.reference_id || null,
            reason: data.reason,
            actor_id: data.actor_id || null
        }
    });
};

const deleteStockMovement = async (movementID) => {
    return await prisma.stock_movements.delete({
        where: {
            movementID
        }
    });
};

module.exports = {
    getAllStockMovements,
    getStockMovementById,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement
};
