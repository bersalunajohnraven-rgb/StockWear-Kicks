
const saleService = require('../services/saleService');

const getAllSales = async (req, res) => {
    try {
        const sales = await saleService.getAllSales(req.user);

        res.status(200).json(sales);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error fetching sales',
            error: error.message
        });
    }
};

const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await saleService.getSaleById(id, req.user);

        if (!sale) {
            return res.status(404).json({
                message: 'Sale not found'
            });
        }

        res.status(200).json(sale);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error fetching sale',
            error: error.message
        });
    }
};

const createSale = async (req, res) => {
    try {
        const sale = await saleService.createSale(req.body, req.user);

        res.status(201).json(sale);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error creating sale',
            error: error.message
        });
    }
};

const updateSale = async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await saleService.updateSale(id, req.body, req.user);

        if (!sale) {
            return res.status(404).json({
                message: 'Sale not found'
            });
        }

        res.status(200).json(sale);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error updating sale',
            error: error.message
        });
    }
};

const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await saleService.deleteSale(id, req.user);

        if (!deleted) {
            return res.status(404).json({
                message: 'Sale not found'
            });
        }

        res.status(200).json({
            message: 'Sale deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error deleting sale',
            error: error.message
        });
    }
};

module.exports = {
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale
};
