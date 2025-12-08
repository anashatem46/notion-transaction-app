const { notion } = require('../config/notion');
const { DEFAULT_PROPERTIES, PROPERTY_TYPES } = require('../constants/notionProperties');

// Cache for database schemas
const schemaCache = new Map();

/**
 * Get database schema with caching
 */
async function getDatabaseSchema(databaseId) {
    if (schemaCache.has(databaseId)) {
        return schemaCache.get(databaseId);
    }

    try {
        const database = await notion.databases.retrieve({ database_id: databaseId });
        schemaCache.set(databaseId, database);
        return database;
    } catch (error) {
        if (error.code === 'validation_error' && error.message.includes('page, not a database')) {
            throw {
                code: 'validation_error',
                message: error.message,
                isPageNotDatabase: true
            };
        }
        throw error;
    }
}

/**
 * Find property name by type in database schema
 */
function findPropertyByType(database, propertyType, preferredName = null) {
    // Try exact match first if preferred name provided
    if (preferredName && database.properties[preferredName]) {
        return preferredName;
    }

    // Search by type
    for (const [key, value] of Object.entries(database.properties)) {
        if (value.type === propertyType) {
            return key;
        }
    }

    return null;
}

/**
 * Find relation property by keyword
 */
function findRelationProperty(database, keywords) {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    for (const [key, value] of Object.entries(database.properties)) {
        if (value.type === PROPERTY_TYPES.RELATION) {
            const lowerKey = key.toLowerCase();
            if (lowerKeywords.some(keyword => lowerKey.includes(keyword))) {
                return key;
            }
        }
    }

    return null;
}

/**
 * Get transaction database property names
 */
async function getTransactionProperties(databaseId) {
    const database = await getDatabaseSchema(databaseId);
    const defaults = DEFAULT_PROPERTIES.TRANSACTIONS;

    return {
        title: findPropertyByType(database, PROPERTY_TYPES.TITLE, defaults.TITLE) || defaults.TITLE,
        amount: findPropertyByType(database, PROPERTY_TYPES.NUMBER, defaults.AMOUNT) || defaults.AMOUNT,
        type: findPropertyByType(database, PROPERTY_TYPES.SELECT, defaults.TYPE) || defaults.TYPE,
        date: findPropertyByType(database, PROPERTY_TYPES.DATE, defaults.DATE) || defaults.DATE,
        account: findRelationProperty(database, ['account']) || defaults.ACCOUNT,
        category: findRelationProperty(database, ['category', 'spending']) || defaults.CATEGORY,
        note: findPropertyByType(database, PROPERTY_TYPES.RICH_TEXT, defaults.NOTE) || defaults.NOTE
    };
}

/**
 * Get account database property names
 */
async function getAccountProperties(databaseId) {
    const database = await getDatabaseSchema(databaseId);
    const defaults = DEFAULT_PROPERTIES.ACCOUNTS;

    return {
        title: findPropertyByType(database, PROPERTY_TYPES.TITLE, defaults.TITLE) || defaults.TITLE,
        balance: database.properties[defaults.BALANCE] 
            ? defaults.BALANCE 
            : findPropertyByType(database, PROPERTY_TYPES.NUMBER) || 
              findPropertyByType(database, PROPERTY_TYPES.FORMULA) || 
              defaults.BALANCE
    };
}

/**
 * Get category database property names
 */
async function getCategoryProperties(databaseId) {
    const database = await getDatabaseSchema(databaseId);
    const defaults = DEFAULT_PROPERTIES.CATEGORIES;

    return {
        title: findPropertyByType(database, PROPERTY_TYPES.TITLE, defaults.TITLE) || defaults.TITLE
    };
}

/**
 * Get select option value matching input type
 */
function getMatchingSelectOption(selectProperty, inputType) {
    if (!selectProperty || selectProperty.type !== 'select') {
        return null;
    }

    const options = selectProperty.select?.options || [];
    const typeLower = inputType.toLowerCase();

    // Try to find matching option (case-insensitive, with or without emoji)
    const matchedOption = options.find(option => {
        const optionName = option.name.toLowerCase();
        if (typeLower.includes('expense') && optionName.includes('expense')) {
            return true;
        }
        if (typeLower.includes('income') && optionName.includes('income')) {
            return true;
        }
        return false;
    });

    if (matchedOption) {
        return matchedOption.name;
    }

    // Try exact match
    const exactMatch = options.find(option => option.name === inputType);
    if (exactMatch) {
        return exactMatch.name;
    }

    return null;
}

/**
 * Extract title from page property
 */
function extractTitle(page, propertyName) {
    const titleProp = page.properties[propertyName];
    return titleProp?.title?.[0]?.plain_text || null;
}

/**
 * Extract number from page property
 */
function extractNumber(page, propertyName) {
    const numberProp = page.properties[propertyName];
    return numberProp?.number || 0;
}

/**
 * Extract date from page property
 */
function extractDate(page, propertyName) {
    const dateProp = page.properties[propertyName]?.date;
    return dateProp?.start || null;
}

/**
 * Extract balance from account property (handles number, formula, rich_text)
 */
function extractBalance(accountPage, propertyName) {
    const balanceProp = accountPage.properties[propertyName];
    let balance = 0;

    if (balanceProp?.type === PROPERTY_TYPES.NUMBER) {
        balance = balanceProp.number || 0;
    } else if (balanceProp?.type === PROPERTY_TYPES.FORMULA) {
        if (balanceProp.formula?.type === 'number') {
            balance = balanceProp.formula.number || 0;
        } else if (balanceProp.formula?.type === 'string') {
            const balanceStr = balanceProp.formula.string || '0';
            balance = parseFloat(balanceStr.replace(/[^0-9.-]/g, '')) || 0;
        }
    } else if (balanceProp?.type === PROPERTY_TYPES.RICH_TEXT) {
        const balanceText = balanceProp.rich_text?.[0]?.plain_text || '0';
        balance = parseFloat(balanceText.replace(/[^0-9.-]/g, '')) || 0;
    }

    return parseFloat(balance.toFixed(2));
}

/**
 * Determine transaction type from select property
 */
function determineTransactionType(typeProperty) {
    if (!typeProperty?.select) {
        return 'expense';
    }

    const typeName = typeProperty.select.name.toLowerCase();
    if (typeName.includes('income')) {
        return 'income';
    } else if (typeName.includes('expense')) {
        return 'expense';
    }

    return 'expense';
}

/**
 * Query database with sorting, fallback to unsorted if sort fails
 */
async function queryDatabaseWithSort(databaseId, options = {}) {
    const { sortProperty, sortDirection = 'ascending', pageSize } = options;

    try {
        const queryOptions = {
            database_id: databaseId,
            page_size: pageSize
        };

        if (sortProperty) {
            queryOptions.sorts = [{
                property: sortProperty,
                direction: sortDirection
            }];
        }

        return await notion.databases.query(queryOptions);
    } catch (sortError) {
        // If sorting fails, query without sort
        // Sorting failed, will fetch without sort
        return await notion.databases.query({
            database_id: databaseId,
            page_size: pageSize || 100
        });
    }
}

/**
 * Clear schema cache (useful for testing or when schema changes)
 */
function clearSchemaCache(databaseId = null) {
    if (databaseId) {
        schemaCache.delete(databaseId);
    } else {
        schemaCache.clear();
    }
}

module.exports = {
    getDatabaseSchema,
    getTransactionProperties,
    getAccountProperties,
    getCategoryProperties,
    getMatchingSelectOption,
    extractTitle,
    extractNumber,
    extractDate,
    extractBalance,
    determineTransactionType,
    queryDatabaseWithSort,
    clearSchemaCache,
    notion
};
