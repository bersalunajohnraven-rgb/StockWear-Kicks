const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const auditLogController = require('../controllers/auditLogController');

router.get(
    '/',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    auditLogController.getAuditLogs
);

module.exports = router;
