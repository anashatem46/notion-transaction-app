const { TRANSACTIONS_DB_ID } = require('../config/notion');
const notionService = require('./notionService');
const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Create a new transaction in Notion
 */
async function createTransaction(transactionData) {
    const { name, amount, type, date, account, category, note } = transactionData;

    // Validate required fields - category is only required for expenses
    let missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (amount === undefined || amount === null) missingFields.push('amount');
    if (!type || type.trim() === '') missingFields.push('type');
    if (!date || date.trim() === '') missingFields.push('date');
    if (!account || account.trim() === '') missingFields.push('account');
    
    // Category is required only for expenses, NOT for income
    // Be very explicit: if it contains "income", it's income and category is optional
    const typeString = type ? String(type).trim() : '';
    const transactionType = typeString.toLowerCase();
    const isIncome = transactionType === 'income' || transactionType.includes('income');
    const isExpense = (transactionType === 'expense' || transactionType.includes('expense')) && !isIncome;
    
    // Validation is handled here; avoid noisy console logs in production
    
    // ONLY require category for expenses (not for income)
    // If it's income, NEVER require category - skip validation entirely
    if (isIncome) {
        // Income transactions - category is always optional
        // Income transaction: category is optional
    } else if (isExpense) {
        // Expense transactions - category is required
        if (!category || (typeof category === 'string' && category.trim() === '')) {
            missingFields.push('category');
            // Expense transaction: category missing
        } else {
            // Expense transaction: category provided
        }
    } else {
        // Unknown transaction type - category is optional
        // Unknown type: treat category as optional
    }

    // Final safeguard: if it's income, remove category from missingFields if it's there
    if (isIncome && missingFields.includes('category')) {
        // Ensure category is not required for income
        missingFields = missingFields.filter(field => field !== 'category');
    }
    
    if (missingFields.length > 0) {
        // Bubble up validation errors with details
        throw {
            code: 'VALIDATION_ERROR',
            ...ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(missingFields)
        };
    }

    // Get database schema and properties
    let database;
    try {
        database = await notionService.getDatabaseSchema(TRANSACTIONS_DB_ID);
    } catch (error) {
        if (error.isPageNotDatabase) {
            throw {
                code: 'VALIDATION_ERROR',
                ...ERROR_MESSAGES.INVALID_DATABASE_ID('Transactions')
            };
        }
        throw error;
    }

    const properties = await notionService.getTransactionProperties(TRANSACTIONS_DB_ID);

    // Get matching transaction type option
    const typeProperty = database.properties[properties.type];
    const actualTypeValue = notionService.getMatchingSelectOption(typeProperty, type);

    if (!actualTypeValue) {
        const availableOptions = typeProperty?.select?.options?.map(o => o.name) || [];
        throw {
            code: 'VALIDATION_ERROR',
            ...ERROR_MESSAGES.INVALID_TRANSACTION_TYPE(type, availableOptions)
        };
    }

    // Build properties object
    const pageProperties = {
        [properties.title]: {
            title: [{
                text: {
                    content: name.trim()
                }
            }]
        },
        [properties.amount]: {
            number: parseFloat(amount)
        },
        [properties.type]: {
            select: {
                name: actualTypeValue
            }
        },
        [properties.date]: {
            date: {
                start: date
            }
        },
        [properties.account]: {
            relation: [{
                id: account
            }]
        }
    };

    // Add category only if provided (required for expenses, optional for income)
    if (category && category.trim() !== '') {
        pageProperties[properties.category] = {
            relation: [{
                id: category
            }]
        };
    }

    // Add note if provided
    if (note && note.trim()) {
        pageProperties[properties.note] = {
            rich_text: [{
                text: {
                    content: note.trim()
                }
            }]
        };
    }

    // Create the page in Notion
    try {
        const response = await notionService.notion.pages.create({
            parent: {
                database_id: TRANSACTIONS_DB_ID
            },
            properties: pageProperties
        });

        return {
            success: true,
            pageId: response.id,
            message: 'Transaction created successfully'
        };
    } catch (error) {
        if (error.code === 'object_not_found') {
            throw {
                code: 'NOT_FOUND',
                error: 'Database or relation not found',
                details: error.message,
                hint: 'The category or account ID may be invalid, or the relation property may not be set up correctly in your Transactions database.'
            };
        }
        throw error;
    }
}

/**
 * Get recent transactions
 */
async function getRecentTransactions(limit = 5) {
    const properties = await notionService.getTransactionProperties(TRANSACTIONS_DB_ID);

    // Query recent transactions sorted by date
    const response = await notionService.queryDatabaseWithSort(TRANSACTIONS_DB_ID, {
        sortProperty: properties.date,
        sortDirection: 'descending',
        pageSize: limit
    });

    // Format transactions
    let transactions = response.results.map(page => {
        const name = notionService.extractTitle(page, properties.title);
        const amount = notionService.extractNumber(page, properties.amount);
        const typeProperty = page.properties[properties.type];
        const transactionType = notionService.determineTransactionType(typeProperty);
        const date = notionService.extractDate(page, properties.date);

        let dateTimestamp = 0;
        if (date) {
            dateTimestamp = new Date(date).getTime();
        }

        return {
            name: name || 'Unnamed Transaction',
            amount: amount,
            type: transactionType,
            date: date ? date.split('T')[0] : null,
            _sortDate: dateTimestamp
        };
    });

    // Sort manually if needed (by date descending, then limit)
    transactions.sort((a, b) => b._sortDate - a._sortDate);
    transactions = transactions.slice(0, limit);

    // Remove sort helper
    transactions = transactions.map(({ _sortDate, ...rest }) => rest);

    return transactions;
}

module.exports = {
    createTransaction,
    getRecentTransactions
};
