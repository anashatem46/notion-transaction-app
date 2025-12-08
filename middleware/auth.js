const bcrypt = require('bcrypt');

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }

    if (req.accepts('html')) {
        return res.redirect('/login');
    }

    return res.status(401).json({ error: 'Unauthorized' });
}

/**
 * Check if user is already authenticated (redirect to home if logged in)
 */
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    next();
}

/**
 * Verify login credentials
 */
async function verifyCredentials(username, password, expectedUsername, expectedPasswordHash) {
    if (username !== expectedUsername) {
        return false;
    }

    try {
        return await bcrypt.compare(password, expectedPasswordHash || '');
    } catch (error) {
        return false;
    }
}

module.exports = {
    requireAuth,
    redirectIfAuthenticated,
    verifyCredentials
};
