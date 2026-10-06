const prisma = require('../db/prisma');

const getSalesScope = (user) => {
    const roleName = user.roles.role_name;

    if (roleName === 'owner' || roleName === 'admin') {
        return {};
    }

    if (!user.branchID) {
        throw new Error('A branch assignment is required to access sales');
    }

    return {
        branchID: user.branchID,
        ...(roleName === 'cashier' ? { cashierID: user.userID } : {})
    };
};

const getAllSales = async (user) => {
    return await prisma.sales.findMany({
        where: getSalesScope(user),
        include: {
            branch: true,
            users: true,
            sale_items: {
                include: {
                    products: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

const getSaleById = async (saleID, user) => {
    return await prisma.sales.findFirst({
        where: {
            saleID,
            ...getSalesScope(user)
        },
        include: {
            branch: true,
            users: true,
            sale_items: {
                include: {
                    products: true
                }
            }
        }
    });
};

const createSale = async (data, user) => {
    const isAdmin = ['owner', 'admin'].includes(user.roles.role_name);

    return await prisma.sales.create({
        data: {
            cashierID: isAdmin ? data.cashierID : user.userID,
            branchID: isAdmin ? data.branchID : user.branchID,
            total_amount: data.total_amount || 0
        }
    });
};

const updateSale = async (saleID, data, user) => {
    const existingSale = await getSaleById(saleID, user);

    if (!existingSale) {
        return null;
    }

    const isAdmin = ['owner', 'admin'].includes(user.roles.role_name);

    return await prisma.sales.update({
        where: {
            saleID
        },
        data: {
            cashierID: isAdmin ? data.cashierID : existingSale.cashierID,
            branchID: isAdmin ? data.branchID : existingSale.branchID,
            total_amount: data.total_amount
        }
    });
};

const deleteSale = async (saleID, user) => {
    const existingSale = await getSaleById(saleID, user);

    if (!existingSale) {
        return false;
    }

    return await prisma.sales.delete({
        where: {
            saleID
        }
    });
};

module.exports = {
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    getSalesScope
};