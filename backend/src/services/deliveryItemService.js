const prisma = require('../db/prisma');

const getAllDeliveryItems = async () => {
    return await prisma.delivery_items.findMany({
        include: {
            deliveries: true,
            products: true
        }
    });
};

const getDeliveryItemById = async (id) => {
    return await prisma.delivery_items.findUnique({
        where: {
            delivery_itemID: id
        },
        include: {
            deliveries: true,
            products: true
        }
    });
};

const createDeliveryItem = async (data) => {
    return await prisma.delivery_items.create({
        data: {
            deliveryID: data.deliveryID,
            productID: data.productID,
            quantity_received: Number(data.quantity_received)
        },
        include: {
            deliveries: true,
            products: true
        }
    });
};

const updateDeliveryItem = async (id, data) => {
    return await prisma.delivery_items.update({
        where: {
            delivery_itemID: id
        },
        data: {
            deliveryID: data.deliveryID,
            productID: data.productID,
            quantity_received: Number(data.quantity_received)
        }
    });
};

const deleteDeliveryItem = async (id) => {
    return await prisma.delivery_items.delete({
        where: {
            delivery_itemID: id
        }
    });
};

module.exports = {
    getAllDeliveryItems,
    getDeliveryItemById,
    createDeliveryItem,
    updateDeliveryItem,
    deleteDeliveryItem
};