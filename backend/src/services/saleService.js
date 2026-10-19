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
    const cashierID = isAdmin ? (data.cashierID || user.userID) : user.userID;
    const branchID = isAdmin ? (data.branchID || user.branchID) : user.branchID;

    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        let total = parseFloat(data.total_amount);
        if (isNaN(total) || total <= 0) {
            total = data.items.reduce((sum, it) => sum + (Number(it.quantity || 1) * Number(it.unit_price || 0)), 0);
        }

        const sale = await prisma.sales.create({
            data: {
                cashierID,
                branchID,
                total_amount: total,
                sale_items: {
                    create: data.items.map(it => ({
                        productID: it.productID,
                        quantity: parseInt(it.quantity, 10),
                        unit_price: parseFloat(it.unit_price)
                    }))
                }
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

        // Note: Stock deduction and stock_movements logging are handled automatically
        // by the PostgreSQL trigger 'trg_sale_item_after_insert' upon inserting sale_items.
        return sale;
    }

    return await prisma.sales.create({
        data: {
            cashierID,
            branchID,
            total_amount: data.total_amount || 0
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