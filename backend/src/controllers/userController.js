const userService = require('../services/userService');
const { hashPassword, isValidPassword } = require('../services/authService');
const prisma = require('../db/prisma');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        const formatted = users.map(u => ({
            ...u,
            full_name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            role_name: u.roles?.role_name || 'cashier',
            branchName: u.branch?.name || 'All Branches (Consolidated)'
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve users'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            ...user,
            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role_name: user.roles?.role_name || 'cashier',
            branchName: user.branch?.name || 'All Branches (Consolidated)'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve user'
        });
    }
};

const createUser = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            full_name,
            email,
            password,
            roleID,
            role_name,
            branchID
        } = req.body;

        let resolvedFirstName = firstName;
        let resolvedLastName = lastName;
        if (!resolvedFirstName && full_name) {
            const parts = full_name.trim().split(/\s+/);
            resolvedFirstName = parts[0] || 'User';
            resolvedLastName = parts.slice(1).join(' ') || 'Staff';
        }

        let resolvedRoleID = roleID;
        if (!resolvedRoleID) {
            const targetRoleName = role_name || 'cashier';
            const roleRecord = await prisma.roles.findUnique({
                where: { role_name: targetRoleName }
            });
            if (roleRecord) {
                resolvedRoleID = roleRecord.roleID;
            }
        }

        if (!resolvedFirstName || !resolvedLastName || !email || !password || !resolvedRoleID) {
            return res.status(400).json({
                message: 'Name, email, password, and valid role are required'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters and no more than 72 UTF-8 bytes'
            });
        }

        const password_hash = await hashPassword(password);
        const user = await userService.createUser({
            firstName: resolvedFirstName,
            middleName: middleName || null,
            lastName: resolvedLastName,
            email,
            password_hash,
            roleID: resolvedRoleID,
            branchID: branchID || null
        }, req.user?.userID);

        res.status(201).json({
            ...user,
            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role_name: user.roles?.role_name,
            branchName: user.branch?.name || 'All Branches'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create user',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            firstName,
            middleName,
            lastName,
            full_name,
            email,
            password,
            roleID,
            role_name,
            branchID
        } = req.body;

        let resolvedFirstName = firstName;
        let resolvedLastName = lastName;
        if (!resolvedFirstName && full_name) {
            const parts = full_name.trim().split(/\s+/);
            resolvedFirstName = parts[0];
            resolvedLastName = parts.slice(1).join(' ') || '';
        }

        let resolvedRoleID = roleID;
        if (!resolvedRoleID && role_name) {
            const roleRecord = await prisma.roles.findUnique({
                where: { role_name }
            });
            if (roleRecord) {
                resolvedRoleID = roleRecord.roleID;
            }
        }

        if (password !== undefined && password !== '' && !isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters and no more than 72 UTF-8 bytes'
            });
        }

        const password_hash = (password !== undefined && password !== '')
            ? await hashPassword(password)
            : undefined;

        const user = await userService.updateUser(id, {
            ...(resolvedFirstName !== undefined ? { firstName: resolvedFirstName } : {}),
            ...(middleName !== undefined ? { middleName } : {}),
            ...(resolvedLastName !== undefined ? { lastName: resolvedLastName } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(password_hash !== undefined ? { password_hash } : {}),
            ...(resolvedRoleID !== undefined ? { roleID: resolvedRoleID } : {}),
            branchID: branchID !== undefined ? (branchID || null) : undefined
        }, req.user?.userID);

        res.status(200).json({
            ...user,
            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role_name: user.roles?.role_name,
            branchName: user.branch?.name || 'All Branches'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update user',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user?.userID) {
            return res.status(400).json({
                message: 'Cannot delete your own active account'
            });
        }

        await userService.deleteUser(id, req.user?.userID);

        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);

        if (error.code === 'P2003' || error.message?.includes('foreign key constraint')) {
            return res.status(409).json({
                message: 'Cannot delete this user because they have recorded sales, orders, deliveries, or stock movements. User records must be preserved for financial audit trail integrity.'
            });
        }

        res.status(500).json({
            message: error.message || 'Failed to delete user'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};