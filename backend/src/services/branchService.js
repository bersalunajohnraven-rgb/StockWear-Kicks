const prisma = require('../db/prisma');
const { runInAuditTransaction } = require('../db/auditTransaction');

const getAllBranches = async () => {
    return await prisma.branch.findMany({
        orderBy: {
            created_at: 'desc'
        }
    });
};

const getBranchById = async (branchID) => {
    return await prisma.branch.findUnique({
        where: {
            branchID: branchID
        }
    });
};

const createBranch = async (data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.branch.create({
            data: {
                name: data.name,
                address: data.address
            }
        });
    });
};

const updateBranch = async (branchID, data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.branch.update({
            where: {
                branchID: branchID
            },
            data: {
                name: data.name,
                address: data.address
            }
        });
    });
};

const deleteBranch = async (branchID, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.branch.delete({
            where: {
                branchID: branchID
            }
        });
    });
};

module.exports = {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
};