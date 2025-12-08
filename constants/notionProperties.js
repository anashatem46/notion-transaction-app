// Default property names for Notion databases
const DEFAULT_PROPERTIES = {
    TRANSACTIONS: {
        TITLE: 'Transaction Name',
        AMOUNT: 'Amount',
        TYPE: 'Transaction Type',
        DATE: 'Date',
        ACCOUNT: 'Linked Account',
        CATEGORY: 'Spending Category',
        NOTE: 'Note'
    },
    ACCOUNTS: {
        TITLE: 'Name',
        BALANCE: 'Current Status'
    },
    CATEGORIES: {
        TITLE: 'Name'
    }
};

// Property type mappings
const PROPERTY_TYPES = {
    TITLE: 'title',
    NUMBER: 'number',
    SELECT: 'select',
    DATE: 'date',
    RELATION: 'relation',
    RICH_TEXT: 'rich_text',
    FORMULA: 'formula'
};

module.exports = {
    DEFAULT_PROPERTIES,
    PROPERTY_TYPES
};
