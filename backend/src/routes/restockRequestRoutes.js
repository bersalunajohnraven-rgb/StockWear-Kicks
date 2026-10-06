const express = require('express');

const router = express.Router();

const {
    getAllRestockRequests,
    getRestockRequestById,
    createRestockRequest,
    updateRestockRequest,
    deleteRestockRequest
} = require('../controllers/restockRequestController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all restock requests
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    getAllRestockRequests
);

// GET restock request by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    getRestockRequestById
);

// CREATE restock request
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    createRestockRequest
);

// UPDATE restock request
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    updateRestockRequest
);

// DELETE restock request
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    deleteRestockRequest
);

module.exports = router;