const express = require('express');

const router = express.Router();

const deliveryController = require('../controllers/deliveryController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all deliveries
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryController.getAllDeliveries
);

// GET delivery by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryController.getDeliveryById
);

// CREATE delivery
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryController.createDelivery
);

// UPDATE delivery
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryController.updateDelivery
);

// DELETE delivery
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deliveryController.deleteDelivery
);

module.exports = router;