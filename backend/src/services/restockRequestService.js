const prisma = require('../db/prisma');

const getAllRestockRequests = async () => {
    return await prisma.restock_requests.findMany({
        include: {
            products: true,
            branch: true,
            users: true,
            purchase_orders: true
        }
    });
};

const getRestockRequestById = async (id) => {
    return await prisma.restock_requests.findUnique({
        where: {
            requestID: id
        },
        include: {
            products: true,
            branch: true,
            users: true,
            purchase_orders: true
        }
    });
};

const createRestockRequest = async (data) => {
    return await prisma.restock_requests.create({
        data: {
            productID: data.productID,
            branchID: data.branchID,
            request_qty: data.request_qty,
            status: data.status ?? "pending"
        }
    });
};

const updateRestockRequest = async (id, data) => {
    return await prisma.restock_requests.update({
        where: {
            requestID: id
        },
        data: {
            productID: data.productID,
            branchID: data.branchID,
            request_qty: data.request_qty,
            status: data.status,
            approved_by: data.approved_by,
            approved_at: data.approved_at
        }
    });
};

const deleteRestockRequest = async (id) => {
    return await prisma.restock_requests.delete({
        where: {
            requestID: id
        }
    });
};

module.exports = {
    getAllRestockRequests,
    getRestockRequestById,
    createRestockRequest,
    updateRestockRequest,
    deleteRestockRequest
};