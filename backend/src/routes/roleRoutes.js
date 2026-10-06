const express = require('express');

const router = express.Router();

const roleController = require('../controllers/roleController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all roles
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    roleController.getAllRoles
);

// GET role by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    roleController.getRoleById
);

// CREATE role
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    roleController.createRole
);

// UPDATE role
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    roleController.updateRole
);

// DELETE role
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    roleController.deleteRole
);

module.exports = router;