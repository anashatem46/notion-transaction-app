const express = require('express');
const router = express.Router();
const { notion, ACCOUNTS_DB_ID } = require('../config/notion');

// GET /accounts - Fetch accounts from Notion
router.get('/', async (req, res) => {
    try {
        if (!ACCOUNTS_DB_ID) {
            return res.status(500).json({ 
                error: 'Accounts database ID not configured',
                details: 'NOTION_ACCOUNTS_DB_ID environment variable is missing' 
            });
        }

        // First, get the database schema to find the title property name
        const database = await notion.databases.retrieve({ database_id: ACCOUNTS_DB_ID });
        
        // Find the title property (first property of type 'title' or first property)
        let titlePropertyName = 'Name';
        for (const [key, value] of Object.entries(database.properties)) {
            if (value.type === 'title') {
                titlePropertyName = key;
                break;
            }
        }
        
        // Query the Accounts database
        let response;
        try {
            // Try with sorting first
            response = await notion.databases.query({
                database_id: ACCOUNTS_DB_ID,
                sorts: [
                    {
                        property: titlePropertyName,
                        direction: 'ascending'
                    }
                ]
            });
        } catch (sortError) {
            // If sorting fails, query without sort
            console.warn('Sorting failed, fetching without sort:', sortError.message);
            response = await notion.databases.query({
                database_id: ACCOUNTS_DB_ID
            });
        }

        // Extract account id and name
        const accounts = response.results.map(page => {
            const titleProp = page.properties[titlePropertyName];
            return {
                id: page.id,
                name: titleProp?.title?.[0]?.plain_text || 'Unnamed Account'
            };
        });
        
        // Sort manually if we couldn't sort via API
        accounts.sort((a, b) => a.name.localeCompare(b.name));

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        
        // Provide helpful error message for common issues
        if (error.code === 'validation_error' && error.message.includes('page, not a database')) {
            return res.status(400).json({ 
                error: 'Invalid Accounts Database ID',
                details: 'The provided ID is a page ID, not a database ID. Please get the database ID from the URL before "?v=" when viewing the database as a full page in Notion.',
                hint: 'Open your Accounts database in Notion, copy the URL, and extract the 32-character ID before "?v="'
            });
        }
        
        if (error.code === 'object_not_found') {
            return res.status(404).json({ 
                error: 'Accounts database not found',
                details: 'The database ID does not exist or the integration does not have access to it.',
                hint: 'Make sure the database is shared with your Notion integration'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch accounts',
            details: error.message 
        });
    }
});

module.exports = router;

