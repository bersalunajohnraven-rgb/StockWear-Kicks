const express = require('express');

const router = express.Router();

const supplierController = require('../controllers/supplierController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all suppliers
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    supplierController.getAllSuppliers
);

// GET supplier by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    supplierController.getSupplierById
);

// CREATE supplier
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    supplierController.createSupplier
);

// UPDATE supplier
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    supplierController.updateSupplier
);

// DELETE supplier
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    supplierController.deleteSupplier
);

module.exports = router;