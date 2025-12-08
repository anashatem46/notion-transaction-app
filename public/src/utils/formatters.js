/**
 * Formatting utilities
 */

/**
 * Format currency amount
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString, options = {}) {
    if (!dateString) {
        return 'Unknown date';
    }

    const date = new Date(dateString);
    const defaultOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    };

    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
function formatDateForInput(date) {
    if (!date) {
        return '';
    }

    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get today's date formatted for input
 */
function getTodayDate() {
    return formatDateForInput(new Date());
}

module.exports = {
    formatCurrency,
    formatDate,
    formatDateForInput,
    getTodayDate
};
