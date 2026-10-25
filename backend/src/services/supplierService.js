const prisma = require('../db/prisma');
const { runInAuditTransaction } = require('../db/auditTransaction');

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

const createSupplier = async (data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.suppliers.create({
            data: {
                name: data.name,
                contact_info: data.contact_info
            }
        });
    });
};

const updateSupplier = async (supplierID, data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.suppliers.update({
            where: {
                supplierID: supplierID
            },
            data: {
                name: data.name,
                contact_info: data.contact_info
            }
        });
    });
};

const deleteSupplier = async (supplierID, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.suppliers.delete({
            where: {
                supplierID: supplierID
            }
        });
    });
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};