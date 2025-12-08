// Error codes and messages
const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    INVALID_DATABASE_ID: 'INVALID_DATABASE_ID',
    OBJECT_NOT_FOUND: 'OBJECT_NOT_FOUND'
};

const ERROR_MESSAGES = {
    INVALID_DATABASE_ID: (dbType) => ({
        error: `Invalid ${dbType} Database ID`,
        details: 'The provided ID is a page ID, not a database ID. Please get the database ID from the URL before "?v=" when viewing the database as a full page in Notion.',
        hint: `Open your ${dbType} database in Notion as a full page, copy the URL, and extract the 32-character ID before "?v=". Update NOTION_${dbType.toUpperCase()}_DB_ID in your .env file.`
    }),
    DATABASE_NOT_FOUND: (dbType) => ({
        error: `${dbType} database not found`,
        details: 'The database ID does not exist or the integration does not have access to it.',
        hint: 'Make sure the database is shared with your Notion integration'
    }),
    MISSING_REQUIRED_FIELDS: (fields) => ({
        error: 'Missing required fields',
        details: `The following fields are required: ${fields.join(', ')}`
    }),
    INVALID_TRANSACTION_TYPE: (type, available) => ({
        error: 'Invalid transaction type',
        details: `"${type}" is not a valid option. Available options: ${available.join(', ')}`,
        hint: 'Please use one of the available transaction types from your Notion database.'
    })
};

module.exports = {
    ERROR_CODES,
    ERROR_MESSAGES
};
