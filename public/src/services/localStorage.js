/**
 * LocalStorage service for managing browser storage
 */
class LocalStorageService {
    /**
     * Get item from localStorage
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.warn(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Set item in localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Error writing to localStorage key "${key}":`, error);
            return false;
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Error removing from localStorage key "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Get selected account IDs
     */
    getSelectedAccountIds() {
        return this.get('selectedAccountIds', null);
    }

    /**
     * Set selected account IDs
     */
    setSelectedAccountIds(accountIds) {
        return this.set('selectedAccountIds', accountIds);
    }
}

// Export singleton instance
const localStorageService = new LocalStorageService();
module.exports = localStorageService;
