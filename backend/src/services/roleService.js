const prisma = require('../db/prisma');
const { runInAuditTransaction } = require('../db/auditTransaction');

const getAllRoles = async () => {
    return await prisma.roles.findMany({
        orderBy: {
            role_name: 'asc'
        }
    });
};

const getRoleById = async (roleID) => {
    return await prisma.roles.findUnique({
        where: {
            roleID: roleID
        }
    });
};

const createRole = async (data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.roles.create({
            data: {
                role_name: data.role_name
            }
        });
    });
};

const updateRole = async (roleID, data, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.roles.update({
            where: {
                roleID: roleID
            },
            data: {
                role_name: data.role_name
            }
        });
    });
};

const deleteRole = async (roleID, currentUserId) => {
    return await runInAuditTransaction(currentUserId, async (tx) => {
        return await tx.roles.delete({
            where: {
                roleID: roleID
            }
        });
    });
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};