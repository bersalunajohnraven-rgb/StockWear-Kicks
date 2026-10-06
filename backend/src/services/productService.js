const prisma = require('../db/prisma');

const getAllProducts = async () => {
    return await prisma.products.findMany({
        orderBy: {
            created_at: 'desc'
        }
    });
};

const getProductById = async (productID) => {
    return await prisma.products.findUnique({
        where: {
            productID: productID
        }
    });
};

const createProduct = async (data) => {
    return await prisma.products.create({
        data: {
            sku: data.sku,
            name: data.name,
            unit_cost: data.unit_cost,
            unit_price: data.unit_price
        }
    });
};

const updateProduct = async (productID, data) => {
    return await prisma.products.update({
        where: {
            productID: productID
        },
        data: {
            sku: data.sku,
            name: data.name,
            unit_cost: data.unit_cost,
            unit_price: data.unit_price
        }
    });
};

const deleteProduct = async (productID) => {
    return await prisma.products.delete({
        where: {
            productID: productID
        }
    });
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};