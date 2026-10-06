const prisma = require('../db/prisma');

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

const createBranch = async (data) => {
    return await prisma.branch.create({
        data: {
            name: data.name,
            address: data.address
        }
    });
};

const updateBranch = async (branchID, data) => {
    return await prisma.branch.update({
        where: {
            branchID: branchID
        },
        data: {
            name: data.name,
            address: data.address
        }
    });
};

const deleteBranch = async (branchID) => {
    return await prisma.branch.delete({
        where: {
            branchID: branchID
        }
    });
};

module.exports = {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
};