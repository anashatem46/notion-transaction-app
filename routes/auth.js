const express = require('express');
const router = express.Router();
const { verifyCredentials, redirectIfAuthenticated } = require('../middleware/auth');
const logger = require('../middleware/logger');

const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH;

// GET /login - Show login page
router.get('/', redirectIfAuthenticated, (req, res) => {
    return res.sendFile('login.html', { root: 'public' });
});

// POST /login - Handle login
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const isValid = await verifyCredentials(username, password, APP_USERNAME, APP_PASSWORD_HASH);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.user = { username };
        return res.json({ success: true });
    } catch (error) {
        logger.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout handler function (exported for use in server.js)
function handleLogout(req, res) {
    if (!req.session) {
        return res.json({ success: true });
    }

    req.session.destroy(err => {
        if (err) {
            logger.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('notion_session');
        return res.json({ success: true });
    });
}

module.exports = router;
module.exports.handleLogout = handleLogout;
