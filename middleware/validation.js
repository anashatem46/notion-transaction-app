/**
 * Validation middleware for common request validations
 */

/**
 * Validate that required fields are present in request body
 */
function validateRequiredFields(requiredFields) {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => {
            const value = req.body[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: `The following fields are required: ${missingFields.join(', ')}`
            });
        }

        next();
    };
}

/**
 * Validate query parameters
 */
function validateQueryParams(validators) {
    return (req, res, next) => {
        for (const [param, validator] of Object.entries(validators)) {
            const value = req.query[param];
            if (value !== undefined && !validator(value)) {
                return res.status(400).json({
                    error: 'Invalid query parameter',
                    details: `Invalid value for parameter: ${param}`
                });
            }
        }
        next();
    };
}

/**
 * Validate number range
 */
function validateNumberRange(min, max) {
    return (value) => {
        const num = parseInt(value, 10);
        return !isNaN(num) && num >= min && num <= max;
    };
}

module.exports = {
    validateRequiredFields,
    validateQueryParams,
    validateNumberRange
};
