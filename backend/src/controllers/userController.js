const userService = require('../services/userService');
const { hashPassword, isValidPassword } = require('../services/authService');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json(users);
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

        res.status(200).json(user);
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
            email,
            password,
            roleID,
            branchID
        } = req.body;

        if (!firstName || !lastName || !email || !password || !roleID) {
            return res.status(400).json({
                message: 'firstName, lastName, email, password, and roleID are required'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 12 characters and no more than 72 UTF-8 bytes'
            });
        }

        const password_hash = await hashPassword(password);
        const user = await userService.createUser({
            firstName,
            middleName,
            lastName,
            email,
            password_hash,
            roleID,
            branchID
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create user'
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
            email,
            password,
            roleID,
            branchID
        } = req.body;

        if (password !== undefined && !isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 12 characters and no more than 72 UTF-8 bytes'
            });
        }

        const password_hash = password === undefined
            ? undefined
            : await hashPassword(password);
        const user = await userService.updateUser(id, {
            firstName,
            middleName,
            lastName,
            email,
            password_hash,
            roleID,
            branchID
        });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update user'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await userService.deleteUser(id);

        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete user'
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