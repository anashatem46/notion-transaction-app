/**
 * Simple logger middleware
 */
const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },

    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },

    error: (message, error, ...args) => {
        console.error(`[ERROR] ${message}`, error, ...args);
    },

    /**
     * Express middleware for request logging
     */
    requestLogger: (req, res, next) => {
        const start = Date.now();
        const method = req.method;
        const url = req.originalUrl || req.url;

        // Log request
        logger.info(`${method} ${url}`);

        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - start;
            const status = res.statusCode;
            const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
            logger[logLevel](`${method} ${url} - ${status} (${duration}ms)`);
        });

        next();
    }
};

module.exports = logger;
