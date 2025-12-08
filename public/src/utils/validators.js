/**
 * Validation utilities
 */

/**
 * Validate required field
 */
function isRequired(value) {
    return value !== undefined && value !== null && value !== '';
}

/**
 * Validate number
 */
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate positive number
 */
function isPositiveNumber(value) {
    return isNumber(value) && parseFloat(value) > 0;
}

/**
 * Validate email (basic)
 */
function isEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

/**
 * Validate form data
 */
function validateForm(formData, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];

        if (rule.required && !isRequired(value)) {
            errors[field] = `${field} is required`;
            continue;
        }

        if (value && rule.type === 'number' && !isNumber(value)) {
            errors[field] = `${field} must be a number`;
            continue;
        }

        if (value && rule.type === 'positiveNumber' && !isPositiveNumber(value)) {
            errors[field] = `${field} must be a positive number`;
            continue;
        }

        if (value && rule.type === 'email' && !isEmail(value)) {
            errors[field] = `${field} must be a valid email`;
            continue;
        }

        if (value && rule.minLength && value.length < rule.minLength) {
            errors[field] = `${field} must be at least ${rule.minLength} characters`;
            continue;
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors[field] = `${field} must be at most ${rule.maxLength} characters`;
            continue;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

module.exports = {
    isRequired,
    isNumber,
    isPositiveNumber,
    isEmail,
    validateForm
};
