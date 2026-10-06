const prisma = require('../db/prisma');

const getAllUsers = async () => {
    return await prisma.users.findMany({
        include: {
            roles: true,
            branch: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

const getUserById = async (userID) => {
    return await prisma.users.findUnique({
        where: {
            userID: userID
        },
        include: {
            roles: true,
            branch: true
        }
    });
};

const createUser = async (data) => {
    return await prisma.users.create({
        data: {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            password_hash: data.password_hash,
            roleID: data.roleID,
            branchID: data.branchID || null
        },
        include: {
            roles: true,
            branch: true
        }
    });
};

const updateUser = async (userID, data) => {
    return await prisma.users.update({
        where: {
            userID: userID
        },
        data: {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            password_hash: data.password_hash,
            roleID: data.roleID,
            branchID: data.branchID || null
        },
        include: {
            roles: true,
            branch: true
        }
    });
};

const deleteUser = async (userID) => {
    return await prisma.users.delete({
        where: {
            userID: userID
        }
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};