const prisma = require('../db/prisma');

const getAllSaleItems = async () => {
    return await prisma.sale_items.findMany({
        include: {
            products: true,
            sales: true
        }
    });
};

const getSaleItemById = async (id) => {
    return await prisma.sale_items.findUnique({
        where: {
            itemID: id
        },
        include: {
            products: true,
            sales: true
        }
    });
};

const createSaleItem = async (data) => {
    return await prisma.sale_items.create({
        data: {
            saleID: data.saleID,
            productID: data.productID,
            quantity: data.quantity,
            unit_price: data.unit_price
        }
    });
};

const updateSaleItem = async (id, data) => {
    return await prisma.sale_items.update({
        where: {
            itemID: id
        },
        data: {
            saleID: data.saleID,
            productID: data.productID,
            quantity: data.quantity,
            unit_price: data.unit_price
        }
    });
};

const deleteSaleItem = async (id) => {
    return await prisma.sale_items.delete({
        where: {
            itemID: id
        }
    });
};

module.exports = {
    getAllSaleItems,
    getSaleItemById,
    createSaleItem,
    updateSaleItem,
    deleteSaleItem
};