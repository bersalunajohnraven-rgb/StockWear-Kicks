const express = require('express');

const router = express.Router();

const branchController = require('../controllers/branchController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all branches
router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    branchController.getAllBranches
);

// GET branch by ID
router.get(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin', 'branch_manager'),
    branchController.getBranchById
);

// CREATE branch
router.post(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    branchController.createBranch
);

// UPDATE branch
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    branchController.updateBranch
);

// DELETE branch
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    branchController.deleteBranch
);

module.exports = router;