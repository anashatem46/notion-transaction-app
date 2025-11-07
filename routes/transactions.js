const express = require('express');
const router = express.Router();
const { notion, TRANSACTIONS_DB_ID } = require('../config/notion');

// POST /transaction - Create new transaction in Notion
router.post('/', async (req, res) => {
    try {
        const { name, amount, type, date, account, category, note } = req.body;

        // Validate required fields
        if (!name || !amount || !type || !date || !account || !category) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, amount, type, date, account, and category are required' 
            });
        }

        // Validate transaction type (basic validation - will match to actual options later)
        if (!type) {
            return res.status(400).json({ 
                error: 'Transaction type is required' 
            });
        }

        // Get the database schema to find property names dynamically
        let database;
        try {
            database = await notion.databases.retrieve({ database_id: TRANSACTIONS_DB_ID });
        } catch (dbError) {
            if (dbError.code === 'validation_error' && dbError.message.includes('page, not a database')) {
                return res.status(400).json({ 
                    error: 'Invalid Transactions Database ID',
                    details: 'The provided ID is a page ID, not a database ID. Please get the database ID from the URL before "?v=" when viewing the database as a full page in Notion.',
                    hint: 'Open your Transactions database in Notion as a full page, copy the URL, and extract the 32-character ID before "?v=". Update NOTION_TRANSACTIONS_DB_ID in your .env file.'
                });
            }
            throw dbError;
        }
        
        // Find property names by type - try exact matches first, then fallback to type detection
        let titlePropertyName = null;
        let amountPropertyName = null;
        let typePropertyName = null;
        let datePropertyName = null;
        let accountPropertyName = null;
        let categoryPropertyName = null;
        let notePropertyName = null;
        
        // First, try exact matches (most common names)
        if (database.properties['Transaction Name']) titlePropertyName = 'Transaction Name';
        if (database.properties['Amount']) amountPropertyName = 'Amount';
        if (database.properties['Transaction Type']) typePropertyName = 'Transaction Type';
        if (database.properties['Date']) datePropertyName = 'Date';
        if (database.properties['Linked Account']) accountPropertyName = 'Linked Account';
        if (database.properties['Spending Category']) categoryPropertyName = 'Spending Category';
        if (database.properties['Note']) notePropertyName = 'Note';
        
        // If exact matches not found, search by type
        for (const [key, value] of Object.entries(database.properties)) {
            if (value.type === 'title' && !titlePropertyName) {
                titlePropertyName = key;
            } else if (value.type === 'number' && !amountPropertyName) {
                amountPropertyName = key;
            } else if (value.type === 'select' && !typePropertyName) {
                typePropertyName = key;
            } else if (value.type === 'date' && !datePropertyName) {
                datePropertyName = key;
            } else if (value.type === 'relation') {
                // Try to match by common names
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('account') && !accountPropertyName) {
                    accountPropertyName = key;
                } else if ((lowerKey.includes('category') || lowerKey.includes('spending')) && !categoryPropertyName) {
                    categoryPropertyName = key;
                }
            } else if (value.type === 'rich_text' && !notePropertyName) {
                notePropertyName = key;
            }
        }
        
        // Final fallback to defaults if still not found
        if (!titlePropertyName) titlePropertyName = 'Transaction Name';
        if (!amountPropertyName) amountPropertyName = 'Amount';
        if (!typePropertyName) typePropertyName = 'Transaction Type';
        if (!datePropertyName) datePropertyName = 'Date';
        if (!accountPropertyName) accountPropertyName = 'Linked Account';
        if (!categoryPropertyName) categoryPropertyName = 'Spending Category';
        if (!notePropertyName) notePropertyName = 'Note';
        
        // Get the actual select options for Transaction Type to match correctly
        let actualTypeValue = type; // Default to what was sent
        if (database.properties[typePropertyName] && database.properties[typePropertyName].type === 'select') {
            const selectOptions = database.properties[typePropertyName].select?.options || [];
            const typeLower = type.toLowerCase();
            
            // Try to find matching option (case-insensitive, with or without emoji)
            const matchedOption = selectOptions.find(option => {
                const optionName = option.name.toLowerCase();
                // Check if it contains "expense" or "income" (ignoring emojis)
                if (typeLower.includes('expense') && optionName.includes('expense')) {
                    return true;
                }
                if (typeLower.includes('income') && optionName.includes('income')) {
                    return true;
                }
                return false;
            });
            
            if (matchedOption) {
                actualTypeValue = matchedOption.name; // Use the exact option name from Notion
            } else {
                // If no match found, try exact match
                const exactMatch = selectOptions.find(option => option.name === type);
                if (exactMatch) {
                    actualTypeValue = exactMatch.name;
                } else {
                    // Last resort: use the first option if available, or return error
                    if (selectOptions.length > 0) {
                        console.warn(`Transaction type "${type}" not found in options. Available options: ${selectOptions.map(o => o.name).join(', ')}`);
                        return res.status(400).json({ 
                            error: 'Invalid transaction type',
                            details: `"${type}" is not a valid option. Available options: ${selectOptions.map(o => o.name).join(', ')}`,
                            hint: 'Please use one of the available transaction types from your Notion database.'
                        });
                    }
                }
            }
        }

        // Create the page properties based on your Notion database schema
        const properties = {
            [titlePropertyName]: {
                title: [
                    {
                        text: {
                            content: name
                        }
                    }
                ]
            },
            [amountPropertyName]: {
                number: parseFloat(amount)
            },
            [typePropertyName]: {
                select: {
                    name: actualTypeValue
                }
            },
            [datePropertyName]: {
                date: {
                    start: date
                }
            },
            [accountPropertyName]: {
                relation: [
                    {
                        id: account
                    }
                ]
            },
            [categoryPropertyName]: {
                relation: [
                    {
                        id: category
                    }
                ]
            }
        };

        // Add note if provided
        if (note && note.trim()) {
            properties[notePropertyName] = {
                rich_text: [
                    {
                        text: {
                            content: note
                        }
                    }
                ]
            };
        }

        // Create the page in Notion
        const response = await notion.pages.create({
            parent: {
                database_id: TRANSACTIONS_DB_ID
            },
            properties: properties
        });

        res.json({ 
            success: true, 
            pageId: response.id,
            message: 'Transaction created successfully'
        });

    } catch (error) {
        console.error('Error creating transaction:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Check for specific Notion API errors
        if (error.code === 'validation_error') {
            let errorMessage = error.message;
            let hint = '';
            
            if (error.message.includes('page, not a database')) {
                return res.status(400).json({ 
                    error: 'Invalid Transactions Database ID',
                    details: 'The provided ID is a page ID, not a database ID. Please get the database ID from the URL before "?v=" when viewing the database as a full page in Notion.',
                    hint: 'Open your Transactions database in Notion as a full page, copy the URL, and extract the 32-character ID before "?v=". Update NOTION_TRANSACTIONS_DB_ID in your .env file.'
                });
            }
            
            if (error.message.includes('property')) {
                hint = 'Check that all property names in your Transactions database match the expected names. The code will try to auto-detect property names, but they must exist in your database.';
            }
            
            return res.status(400).json({ 
                error: 'Invalid data format',
                details: errorMessage,
                hint: hint
            });
        }
        
        if (error.code === 'object_not_found') {
            let errorMessage = error.message;
            let hint = '';
            
            if (error.message.includes('relation')) {
                hint = 'The category or account ID may be invalid, or the relation property may not be set up correctly in your Transactions database.';
            } else if (error.message.includes('database')) {
                hint = 'The Transactions database ID may be incorrect, or the integration may not have access to it.';
            }
            
            return res.status(404).json({ 
                error: 'Database or relation not found',
                details: errorMessage,
                hint: hint
            });
        }

        res.status(500).json({ 
            error: 'Failed to create transaction',
            details: error.message 
        });
    }
});

module.exports = router;

