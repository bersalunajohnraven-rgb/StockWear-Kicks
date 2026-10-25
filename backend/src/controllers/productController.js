const productService = require('../services/productService');

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();

        res.status(200).json(products);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve products'
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to retrieve product'
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const { sku, name, unit_cost, unit_price } = req.body;

        if (
            !sku ||
            !name ||
            unit_cost === undefined ||
            unit_price === undefined
        ) {
            return res.status(400).json({
                message: 'sku, name, unit_cost, and unit_price are required'
            });
        }

        const product = await productService.createProduct({
            sku,
            name,
            unit_cost,
            unit_price
        }, req.user?.userID);

        res.status(201).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to create product'
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const { sku, name, unit_cost, unit_price } = req.body;

        const product = await productService.updateProduct(id, {
            sku,
            name,
            unit_cost,
            unit_price
        }, req.user?.userID);

        res.status(200).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to update product'
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await productService.deleteProduct(id, req.user?.userID);

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to delete product'
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};