const { CATEGORIES_DB_ID } = require('../config/notion');
const notionService = require('./notionService');
const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Get all categories from Notion
 */
async function getAllCategories() {
    try {
        const properties = await notionService.getCategoryProperties(CATEGORIES_DB_ID);

        // Query categories with sorting
        const response = await notionService.queryDatabaseWithSort(CATEGORIES_DB_ID, {
            sortProperty: properties.title,
            sortDirection: 'ascending'
        });

        // Extract category id and name
        const categories = response.results.map(page => {
            const name = notionService.extractTitle(page, properties.title);
            return {
                id: page.id,
                name: name || 'Unnamed Category'
            };
        });

        // Sort manually if we couldn't sort via API
        categories.sort((a, b) => a.name.localeCompare(b.name));

        return categories;
    } catch (error) {
        if (error.code === 'validation_error' && error.message.includes('page, not a database')) {
            throw {
                code: 'VALIDATION_ERROR',
                ...ERROR_MESSAGES.INVALID_DATABASE_ID('Categories')
            };
        }

        if (error.code === 'object_not_found') {
            throw {
                code: 'NOT_FOUND',
                ...ERROR_MESSAGES.DATABASE_NOT_FOUND('Categories')
            };
        }

        throw error;
    }
}

module.exports = {
    getAllCategories
};
