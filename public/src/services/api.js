const { API_ENDPOINTS } = require('../constants/api');

/**
 * Centralized API service for making HTTP requests
 */
class ApiService {
    /**
     * Handle 401 unauthorized - redirect to login
     */
    handleUnauthorized() {
        window.location.href = '/login';
    }

    /**
     * Make a GET request
     */
    async get(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include', // Send cookies with request
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            // Handle 401 - redirect to login
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized - redirecting to login');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(errorData.error || errorData.details || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Make a POST request
     */
    async post(endpoint, data, options = {}) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include', // Send cookies with request
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });

            // Handle 401 - redirect to login
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized - redirecting to login');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
                const errorMessage = errorData.details || errorData.error || 'Request failed';
                const error = new Error(errorMessage);
                error.responseData = errorData;
                throw error;
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all categories
     */
    async getCategories() {
        return this.get(API_ENDPOINTS.CATEGORIES);
    }

    /**
     * Get all accounts
     */
    async getAccounts() {
        return this.get(API_ENDPOINTS.ACCOUNTS);
    }

    /**
     * Get account balances
     */
    async getBalances() {
        return this.get(API_ENDPOINTS.BALANCE);
    }

    /**
     * Get recent transactions
     */
    async getRecentTransactions(limit = 5) {
        return this.get(`${API_ENDPOINTS.RECENT_TRANSACTIONS}?limit=${limit}`);
    }

    /**
     * Create a transaction
     */
    async createTransaction(transactionData) {
        return this.post(API_ENDPOINTS.TRANSACTION, transactionData);
    }

    /**
     * Logout
     */
    async logout() {
        return this.post(API_ENDPOINTS.LOGOUT);
    }
}

// Export singleton instance
const apiService = new ApiService();
module.exports = apiService;
