const prisma = require('../db/prisma');
const { runInAuditTransaction } = require('../db/auditTransaction');

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

const createUser = async (data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.users.create({
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
    });
};

const updateUser = async (userID, data, currentUserId) => {
    const updateData = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.middleName !== undefined) updateData.middleName = data.middleName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password_hash !== undefined && data.password_hash !== '') updateData.password_hash = data.password_hash;
    if (data.roleID !== undefined) updateData.roleID = data.roleID;
    if (data.branchID !== undefined) updateData.branchID = data.branchID || null;

    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.users.update({
            where: {
                userID: userID
            },
            data: updateData,
            include: {
                roles: true,
                branch: true
            }
        });
    });
};

const deleteUser = async (userID, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.users.delete({
            where: {
                userID: userID
            }
        });
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};