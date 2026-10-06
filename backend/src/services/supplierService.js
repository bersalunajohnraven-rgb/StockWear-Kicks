const prisma = require('../db/prisma');

const getAllSuppliers = async () => {
    return await prisma.suppliers.findMany({
        orderBy: {
            name: 'asc'
        }
    });
};

const getSupplierById = async (supplierID) => {
    return await prisma.suppliers.findUnique({
        where: {
            supplierID: supplierID
        }
    });
};

const createSupplier = async (data) => {
    return await prisma.suppliers.create({
        data: {
            name: data.name,
            contact_info: data.contact_info
        }
    });
};

const updateSupplier = async (supplierID, data) => {
    return await prisma.suppliers.update({
        where: {
            supplierID: supplierID
        },
        data: {
            name: data.name,
            contact_info: data.contact_info
        }
    });
};

const deleteSupplier = async (supplierID) => {
    return await prisma.suppliers.delete({
        where: {
            supplierID: supplierID
        }
    });
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};