const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

// Database IDs
const TRANSACTIONS_DB_ID = process.env.NOTION_TRANSACTIONS_DB_ID;
const CATEGORIES_DB_ID = process.env.NOTION_CATEGORIES_DB_ID || TRANSACTIONS_DB_ID;
const ACCOUNTS_DB_ID = process.env.NOTION_ACCOUNTS_DB_ID;

module.exports = {
    notion,
    TRANSACTIONS_DB_ID,
    CATEGORIES_DB_ID,
    ACCOUNTS_DB_ID
};

