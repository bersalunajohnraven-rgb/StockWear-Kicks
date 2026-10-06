const express = require('express');

const router = express.Router();

const deliveryItemController = require('../controllers/deliveryItemController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all delivery items
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryItemController.getAllDeliveryItems
);

// GET delivery item by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryItemController.getDeliveryItemById
);

// CREATE delivery item
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryItemController.createDeliveryItem
);

// UPDATE delivery item
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryItemController.updateDeliveryItem
);

// DELETE delivery item
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryItemController.deleteDeliveryItem
);

module.exports = router;