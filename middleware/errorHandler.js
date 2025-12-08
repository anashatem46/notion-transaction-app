const { ERROR_CODES } = require('../constants/errors');
const logger = require('./logger');

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
    // Log the error
    logger.error('Request error:', err);

    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Handle known error types
    if (err.code === ERROR_CODES.VALIDATION_ERROR || err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({
            error: err.error || 'Validation Error',
            details: err.details || err.message,
            hint: err.hint
        });
    }

    if (err.code === ERROR_CODES.NOT_FOUND || err.code === 'NOT_FOUND') {
        return res.status(404).json({
            error: err.error || 'Not Found',
            details: err.details || err.message,
            hint: err.hint
        });
    }

    if (err.code === ERROR_CODES.UNAUTHORIZED || err.code === 'UNAUTHORIZED') {
        return res.status(401).json({
            error: err.error || 'Unauthorized',
            details: err.details || err.message
        });
    }

    if (err.code === ERROR_CODES.INVALID_DATABASE_ID || err.code === 'validation_error') {
        return res.status(400).json({
            error: err.error || 'Invalid Database ID',
            details: err.details || err.message,
            hint: err.hint
        });
    }

    if (err.code === ERROR_CODES.OBJECT_NOT_FOUND || err.code === 'object_not_found') {
        return res.status(404).json({
            error: err.error || 'Object Not Found',
            details: err.details || err.message,
            hint: err.hint
        });
    }

    // Handle Notion API errors
    if (err.code === 'validation_error') {
        let errorMessage = err.message;
        let hint = '';

        if (err.message.includes('page, not a database')) {
            return res.status(400).json({
                error: 'Invalid Database ID',
                details: 'The provided ID is a page ID, not a database ID. Please get the database ID from the URL before "?v=" when viewing the database as a full page in Notion.',
                hint: 'Open your database in Notion as a full page, copy the URL, and extract the 32-character ID before "?v=".'
            });
        }

        if (err.message.includes('property')) {
            hint = 'Check that all property names in your database match the expected names.';
        }

        return res.status(400).json({
            error: 'Invalid data format',
            details: errorMessage,
            hint: hint
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        error: err.error || 'Internal Server Error',
        details: process.env.NODE_ENV === 'production' 
            ? 'An error occurred processing your request' 
            : err.message || err.details
    });
}

module.exports = errorHandler;
