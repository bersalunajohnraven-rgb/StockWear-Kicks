const express = require('express');

const router = express.Router();

const productController = require('../controllers/productController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all products
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    productController.getAllProducts
);

// GET product by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager', 'cashier'),
    productController.getProductById
);

// CREATE product
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    productController.createProduct
);

// UPDATE product
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    productController.updateProduct
);

// DELETE product
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    productController.deleteProduct
);

module.exports = router;