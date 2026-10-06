const express = require('express');

const router = express.Router();

const saleController = require('../controllers/saleController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all sales
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    saleController.getAllSales
);

// GET sale by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    saleController.getSaleById
);

// CREATE sale
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    saleController.createSale
);

// UPDATE sale
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    saleController.updateSale
);

// DELETE sale
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    saleController.deleteSale
);

module.exports = router;