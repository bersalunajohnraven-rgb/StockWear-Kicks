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
    const itemsData = (data.items || []).map(it => ({
        productID: it.productID,
        quantity_received: parseInt(it.quantity_received, 10)
    }));

    const delivery = await prisma.deliveries.create({
        data: {
            orderID: data.orderID,
            branchID: data.branchID,
            received_by: data.received_by || null,
            received_at: data.received_at
                ? new Date(data.received_at)
                : new Date(),
            ...(itemsData.length > 0 ? {
                delivery_items: {
                    create: itemsData
                }
            } : {})
        },
        include: {
            branch: true,
            purchase_orders: true,
            users: true,
            delivery_items: {
                include: {
                    products: true
                }
            }
        }
    });

    // Note: Stock increment and stock_movements logging are handled automatically
    // by the PostgreSQL trigger 'trg_delivery_item_after_insert' upon inserting delivery_items.

    if (data.orderID) {
        try {
            await prisma.purchase_orders.update({
                where: { orderID: data.orderID },
                data: { status: 'received' }
            });
        } catch (err) {
            console.error('Error updating PO status:', err);
        }
    }

    return delivery;
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