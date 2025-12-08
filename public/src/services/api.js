const { API_ENDPOINTS } = require('../constants/api');

/**
 * Centralized API service for making HTTP requests
 */
class ApiService {
    /**
     * Make a GET request
     */
    async get(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

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
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });

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
        console.log('API Service - Sending transaction data:', transactionData);
        try {
            const result = await this.post(API_ENDPOINTS.TRANSACTION, transactionData);
            return result;
        } catch (error) {
            console.error('API Service - Transaction error:', error);
            throw error;
        }
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
