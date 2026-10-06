const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all users
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    userController.getAllUsers
);

// GET user by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    userController.getUserById
);

// CREATE user
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    userController.createUser
);

// UPDATE user
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    userController.updateUser
);

// DELETE user
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    userController.deleteUser
);

module.exports = router;