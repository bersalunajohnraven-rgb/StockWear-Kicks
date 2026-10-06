const express = require('express');

const router = express.Router();

const {
    getAllSaleItems,
    getSaleItemById,
    createSaleItem,
    updateSaleItem,
    deleteSaleItem
} = require('../controllers/saleItemController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all sale items
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    getAllSaleItems
);

// GET sale item by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    getSaleItemById
);

// CREATE sale item
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    createSaleItem
);

// UPDATE sale item
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    updateSaleItem
);

// DELETE sale item
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    deleteSaleItem
);

module.exports = router;