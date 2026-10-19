const express = require('express');
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const prisma = require('../db/prisma');

const router = express.Router();

router.post('/login', authController.login);

router.get('/me', authenticateUser, async (req, res) => {
    try {
        const user = await prisma.users.findUnique({
            where: { userID: req.user.userID },
            include: {
                roles: true,
                branch: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            user: {
                userID: user.userID,
                email: user.email,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                role_name: user.roles.role_name,
                branchID: user.branchID,
                branchName: user.branch?.name || null
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve profile' });
    }
});

module.exports = router;
