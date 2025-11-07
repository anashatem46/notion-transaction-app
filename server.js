const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
const categoriesRoutes = require('./routes/categories');
const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');
const healthRoutes = require('./routes/health');

app.use('/categories', categoriesRoutes);
app.use('/accounts', accountsRoutes);
app.use('/transaction', transactionsRoutes);
app.use('/health', healthRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
});