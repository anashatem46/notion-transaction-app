const { ACCOUNTS_DB_ID } = require('../config/notion');
const notionService = require('./notionService');
const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Get all accounts from Notion
 */
async function getAllAccounts() {
    if (!ACCOUNTS_DB_ID) {
        throw {
            code: 'CONFIG_ERROR',
            error: 'Accounts database ID not configured',
            details: 'NOTION_ACCOUNTS_DB_ID environment variable is missing'
        };
    }

    try {
        const properties = await notionService.getAccountProperties(ACCOUNTS_DB_ID);

        // Query accounts with sorting
        const response = await notionService.queryDatabaseWithSort(ACCOUNTS_DB_ID, {
            sortProperty: properties.title,
            sortDirection: 'ascending'
        });

        // Extract account id and name
        const accounts = response.results.map(page => {
            const name = notionService.extractTitle(page, properties.title);
            return {
                id: page.id,
                name: name || 'Unnamed Account'
            };
        });

        // Sort manually if we couldn't sort via API
        accounts.sort((a, b) => a.name.localeCompare(b.name));

        return accounts;
    } catch (error) {
        if (error.code === 'validation_error' && error.message.includes('page, not a database')) {
            throw {
                code: 'VALIDATION_ERROR',
                ...ERROR_MESSAGES.INVALID_DATABASE_ID('Accounts')
            };
        }

        if (error.code === 'object_not_found') {
            throw {
                code: 'NOT_FOUND',
                ...ERROR_MESSAGES.DATABASE_NOT_FOUND('Accounts')
            };
        }

        throw error;
    }
}

module.exports = {
    getAllAccounts
};
