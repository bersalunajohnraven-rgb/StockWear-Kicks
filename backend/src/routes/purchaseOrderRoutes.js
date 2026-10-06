const express = require('express');

const router = express.Router();

const purchaseOrderController = require('../controllers/purchaseOrderController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all purchase orders
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderController.getAllPurchaseOrders
);

// GET purchase order by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderController.getPurchaseOrderById
);

// CREATE purchase order
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderController.createPurchaseOrder
);

// UPDATE purchase order
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderController.updatePurchaseOrder
);

// DELETE purchase order
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    purchaseOrderController.deletePurchaseOrder
);

module.exports = router;