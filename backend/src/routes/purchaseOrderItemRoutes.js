const express = require('express');

const router = express.Router();

const purchaseOrderItemController = require('../controllers/purchaseOrderItemController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all purchase order items
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderItemController.getAllPurchaseOrderItems
);

// GET purchase order item by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderItemController.getPurchaseOrderItemById
);

// CREATE purchase order item
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderItemController.createPurchaseOrderItem
);

// UPDATE purchase order item
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderItemController.updatePurchaseOrderItem
);

// DELETE purchase order item
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderItemController.deletePurchaseOrderItem
);

module.exports = router;