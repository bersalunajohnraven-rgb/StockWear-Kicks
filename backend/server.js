const { authenticateUser } = require('./src/middleware/authMiddleware');
const { authorizeRoles } = require('./src/middleware/roleMiddleware');
const prisma = require('./src/db/prisma');
const { verifyDatabaseRole } = require('./src/db/verifyDatabaseRole');
const { verifyAuthDatabaseRole } = require('./src/services/authService');

const express = require('express');

const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const branchRoutes = require('./src/routes/branchRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const purchaseOrderRoutes = require('./src/routes/purchaseOrderRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const userRoutes = require('./src/routes/userRoutes');
const purchaseOrderItemRoutes = require('./src/routes/purchaseOrderItemRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const deliveryItemRoutes = require('./src/routes/deliveryItemRoutes');
const stockMovementRoutes = require('./src/routes/stockMovementRoutes');
const saleRoutes = require('./src/routes/saleRoutes');
const saleItemRoutes = require("./src/routes/saleItemRoutes");
const restockRequestRoutes = require("./src/routes/restockRequestRoutes");
const authRoutes = require('./src/routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/purchase-order-items', purchaseOrderItemRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/delivery-items', deliveryItemRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/sales', saleRoutes);
app.use("/api/sale-items", saleItemRoutes);
app.use("/api/restock-requests", restockRequestRoutes);

app.get(
    '/api/test-auth',
    authenticateUser,
    authorizeRoles('owner', 'admin'),
    (req, res) => {
        res.json({
            message: 'Authentication and authorization successful',
            userID: req.user.userID,
            role: req.user.roles.role_name
        });
    }
);


app.get('/', (req, res) => {
    res.json({
        message: 'StockLine backend is running!'
    });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await Promise.all([
            verifyDatabaseRole(),
            verifyAuthDatabaseRole()
        ]);
        app.listen(PORT, () => {
            console.log(`StockLine backend is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database RBAC configuration check failed:', error);
        await prisma.$disconnect();
        process.exitCode = 1;
    }
};

startServer();