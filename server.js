const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const categoriesRoutes = require('./routes/categories');
const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');
const healthRoutes = require('./routes/health');

const SESSION_SECRET = process.env.SESSION_SECRET;
const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH;

if (!SESSION_SECRET || !APP_USERNAME || !APP_PASSWORD_HASH) {
    console.warn('⚠️  SESSION_SECRET, APP_USERNAME, and APP_PASSWORD_HASH must be set in the environment.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Behind a proxy (e.g., Railway), trust the first proxy so req.secure reflects HTTPS
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(session({
    name: 'notion_session',
    secret: SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }

    if (req.accepts('html')) {
        return res.redirect('/login');
    }

    return res.status(401).json({ error: 'Unauthorized' });
}

// Public routes
app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username !== APP_USERNAME) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(password, APP_PASSWORD_HASH || '');

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.user = { username };
        return res.json({ success: true });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/logout', (req, res) => {
    if (!req.session) {
        return res.json({ success: true });
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('notion_session');
        return res.json({ success: true });
    });
});

// Protected static content
app.get('/', requireAuth, (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/public', requireAuth, express.static(path.join(__dirname, 'public')));

// Protected API routes
app.use('/categories', requireAuth, categoriesRoutes);
app.use('/accounts', requireAuth, accountsRoutes);
app.use('/transaction', requireAuth, transactionsRoutes);
app.use('/health', healthRoutes);

// Silence favicon 404 noise
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Access the app at http://localhost:${PORT}`);
    }
});
