const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');
const balanceRoutes = require('./routes/balance');
const recentTransactionsRoutes = require('./routes/recent-transactions');
const healthRoutes = require('./routes/health');

// Import middleware
const { requireAuth } = require('./middleware/auth');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { CONFIG } = require('./constants/config');

// Environment variables
const SESSION_SECRET = process.env.SESSION_SECRET;
const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH;

// Validate required environment variables
if (!SESSION_SECRET || !APP_USERNAME || !APP_PASSWORD_HASH) {
    logger.warn('⚠️  SESSION_SECRET, APP_USERNAME, and APP_PASSWORD_HASH must be set in the environment.');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy in production (for Railway, etc.)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

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
        secure: process.env.NODE_ENV === 'production',
        sameSite: CONFIG.SESSION.SAME_SITE,
        maxAge: CONFIG.SESSION.MAX_AGE
    }
}));

// Public routes
app.use('/login', authRoutes);

// Serve static files from /src path (public, no auth required)
// These are needed to load the React app before authentication
app.use('/src', express.static(path.join(__dirname, 'public', 'src')));

// Protected static content
app.get('/', requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/public', requireAuth, express.static(path.join(__dirname, 'public')));

// Protected API routes
app.use('/categories', requireAuth, categoriesRoutes);
app.use('/accounts', requireAuth, accountsRoutes);
app.use('/transaction', requireAuth, transactionsRoutes);
app.use('/balance', requireAuth, balanceRoutes);
app.use('/recent-transactions', requireAuth, recentTransactionsRoutes);
app.post('/logout', requireAuth, (req, res) => {
    const { handleLogout } = require('./routes/auth');
    handleLogout(req, res);
});
app.use('/health', healthRoutes);

// Silence favicon 404 noise
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        logger.info(`Access the app at http://localhost:${PORT}`);
    }
});
