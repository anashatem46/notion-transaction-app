const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Import the Express app setup
const app = express();

// Import routes
const authRoutes = require('../../routes/auth');
const categoriesRoutes = require('../../routes/categories');
const accountsRoutes = require('../../routes/accounts');
const transactionsRoutes = require('../../routes/transactions');
const balanceRoutes = require('../../routes/balance');
const recentTransactionsRoutes = require('../../routes/recent-transactions');
const healthRoutes = require('../../routes/health');

// Import middleware
const { requireAuth } = require('../../middleware/auth');
const logger = require('../../middleware/logger');
const errorHandler = require('../../middleware/errorHandler');
const { CONFIG } = require('../../constants/config');

// Environment variables
const SESSION_SECRET = process.env.SESSION_SECRET;
const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for Netlify
app.set('trust proxy', 1);

// Request logging
app.use(logger.requestLogger);

// Session configuration
app.use(session({
    name: CONFIG.SESSION.NAME,
    secret: SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: CONFIG.SESSION.HTTP_ONLY,
        secure: true, // Always secure on Netlify (HTTPS)
        sameSite: CONFIG.SESSION.SAME_SITE,
        maxAge: CONFIG.SESSION.MAX_AGE
    }
}));

// Public routes
app.use('/login', authRoutes);

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '../../public')));

// Protected static content - serve index.html
app.get('/', requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Protected API routes
app.use('/categories', requireAuth, categoriesRoutes);
app.use('/accounts', requireAuth, accountsRoutes);
app.use('/transaction', requireAuth, transactionsRoutes);
app.use('/balance', requireAuth, balanceRoutes);
app.use('/recent-transactions', requireAuth, recentTransactionsRoutes);
app.post('/logout', requireAuth, (req, res) => {
    const { handleLogout } = require('../../routes/auth');
    handleLogout(req, res);
});
app.use('/health', healthRoutes);

// Silence favicon 404 noise
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error handling middleware (must be last)
app.use(errorHandler);

// Export serverless handler
module.exports.handler = serverless(app);
