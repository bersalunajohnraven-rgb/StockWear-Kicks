const prisma = require('../db/prisma');

const getAllDeliveries = async () => {
    return await prisma.deliveries.findMany({
        include: {
            branch: true,
            purchase_orders: true,
            users: true
        }
    });
};

const getDeliveryById = async (id) => {
    return await prisma.deliveries.findUnique({
        where: {
            deliveryID: id
        },
        include: {
            branch: true,
            purchase_orders: true,
            users: true
        }
    });
};

const createDelivery = async (data) => {
    return await prisma.deliveries.create({
        data: {
            orderID: data.orderID,
            branchID: data.branchID,
            received_by: data.received_by || null,
            received_at: data.received_at
                ? new Date(data.received_at)
                : null
        },
        include: {
            branch: true,
            purchase_orders: true,
            users: true
        }
    });
};

const updateDelivery = async (id, data) => {
    return await prisma.deliveries.update({
        where: {
            deliveryID: id
        },
        data: {
            orderID: data.orderID,
            branchID: data.branchID,
            received_by: data.received_by || null,
            received_at: data.received_at
                ? new Date(data.received_at)
                : null
        },
        include: {
            branch: true,
            purchase_orders: true,
            users: true
        }
    });
};

const deleteDelivery = async (id) => {
    return await prisma.deliveries.delete({
        where: {
            deliveryID: id
        }
    });
};

module.exports = {
    getAllDeliveries,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery
};