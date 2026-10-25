const branchService = require('../services/branchService');

const getAllBranches = async (req, res) => {
    try {
        const branches = await branchService.getAllBranches();

        res.status(200).json(branches);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve branches'
        });
    }
};

const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;

        const branch = await branchService.getBranchById(id);

        if (!branch) {
            return res.status(404).json({
                message: 'Branch not found'
            });
        }

        res.status(200).json(branch);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve branch'
        });
    }
};

const createBranch = async (req, res) => {
    try {
        const { name, address } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'name is required'
            });
        }

        const branch = await branchService.createBranch({
            name,
            address
        }, req.user?.userID);

        res.status(201).json(branch);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create branch'
        });
    }
};

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address } = req.body;

        const branch = await branchService.updateBranch(id, {
            name,
            address
        }, req.user?.userID);

        res.status(200).json(branch);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update branch'
        });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        await branchService.deleteBranch(id, req.user?.userID);

        res.status(200).json({
            message: 'Branch deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete branch'
        });
    }
};

module.exports = {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
};