const prisma = require('../db/prisma');
const { runInAuditTransaction } = require('../db/auditTransaction');

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

const createProduct = async (data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.products.create({
            data: {
                sku: data.sku,
                name: data.name,
                unit_cost: data.unit_cost,
                unit_price: data.unit_price
            }
        });
    });
};

const updateProduct = async (productID, data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.products.update({
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
    });
};

const deleteProduct = async (productID, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.products.delete({
            where: {
                productID: productID
            }
        });
    });
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};