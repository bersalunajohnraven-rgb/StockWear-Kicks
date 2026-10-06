const express = require('express');

const router = express.Router();

const stockMovementController = require('../controllers/stockMovementController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all stock movements
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    stockMovementController.getAllStockMovements
);

// GET stock movement by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    stockMovementController.getStockMovementById
);

// CREATE stock movement
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    stockMovementController.createStockMovement
);

// UPDATE stock movement
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    stockMovementController.updateStockMovement
);

// DELETE stock movement
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    stockMovementController.deleteStockMovement
);

module.exports = router;