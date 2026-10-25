const supplierService = require('../services/supplierService');

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();

        res.status(200).json(suppliers);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve suppliers'
        });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        const supplier = await supplierService.getSupplierById(id);

        if (!supplier) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        res.status(200).json(supplier);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve supplier'
        });
    }
};

const createSupplier = async (req, res) => {
    try {
        const { name, contact_info } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'name is required'
            });
        }

        const supplier = await supplierService.createSupplier({
            name,
            contact_info
        }, req.user?.userID);

        res.status(201).json(supplier);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create supplier'
        });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_info } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'name is required'
            });
        }

        const supplier = await supplierService.updateSupplier(id, {
            name,
            contact_info
        }, req.user?.userID);

        res.status(200).json(supplier);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update supplier'
        });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        await supplierService.deleteSupplier(id, req.user?.userID);

        res.status(200).json({
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete supplier'
        });
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};