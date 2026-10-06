const prisma = require('../db/prisma');

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

const createRole = async (data) => {
    return await prisma.roles.create({
        data: {
            role_name: data.role_name
        }
    });
};

const updateRole = async (roleID, data) => {
    return await prisma.roles.update({
        where: {
            roleID: roleID
        },
        data: {
            role_name: data.role_name
        }
    });
};

const deleteRole = async (roleID) => {
    return await prisma.roles.delete({
        where: {
            roleID: roleID
        }
    });
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};