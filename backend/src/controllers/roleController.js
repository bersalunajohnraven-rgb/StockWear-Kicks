const roleService = require('../services/roleService');

const getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();

        res.status(200).json(roles);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve roles'
        });
    }
};

const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await roleService.getRoleById(id);

        if (!role) {
            return res.status(404).json({
                message: 'Role not found'
            });
        }

        res.status(200).json(role);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve role'
        });
    }
};

const createRole = async (req, res) => {
    try {
        const { role_name } = req.body;

        if (!role_name) {
            return res.status(400).json({
                message: 'role_name is required'
            });
        }

        const role = await roleService.createRole({
            role_name
        }, req.user?.userID);

        res.status(201).json(role);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create role'
        });
    }
};

const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name } = req.body;

        if (!role_name) {
            return res.status(400).json({
                message: 'role_name is required'
            });
        }

        const role = await roleService.updateRole(id, {
            role_name
        }, req.user?.userID);

        res.status(200).json(role);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update role'
        });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        await roleService.deleteRole(id, req.user?.userID);

        res.status(200).json({
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete role'
        });
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};