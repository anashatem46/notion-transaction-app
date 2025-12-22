const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
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

// Environment variables
const SESSION_SECRET = process.env.SESSION_SECRET;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for Netlify
app.set('trust proxy', 1);

// Request logging
app.use(logger.requestLogger);

// Cookie-session configuration (works in serverless - stores session in cookie)
app.use(cookieSession({
    name: 'session',
    keys: [SESSION_SECRET || 'fallback-secret-key'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true, // Always secure on Netlify (HTTPS)
    httpOnly: true,
    sameSite: 'lax'
}));

// Public routes
app.use('/login', authRoutes);

// Serve static files from public directory
// This is a fallback - Netlify should serve static files directly
app.use('/src', express.static(path.join(__dirname, '../../public/src'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use('/public/src', express.static(path.join(__dirname, '../../public/src')));
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
