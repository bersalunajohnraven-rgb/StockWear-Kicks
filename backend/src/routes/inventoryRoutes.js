const express = require('express');

const router = express.Router();

const inventoryController = require('../controllers/inventoryController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all inventory
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier', 'inventory'),
    inventoryController.getAllInventory
);

// GET inventory by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier', 'inventory'),
    inventoryController.getInventoryById
);

// CREATE inventory
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'inventory'),
    inventoryController.createInventory
);

// UPDATE inventory
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'inventory'),
    inventoryController.updateInventory
);

// DELETE inventory
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'inventory'),
    inventoryController.deleteInventory
);

module.exports = router;