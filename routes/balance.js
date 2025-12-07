const express = require('express');
const router = express.Router();
const { notion, TRANSACTIONS_DB_ID, ACCOUNTS_DB_ID } = require('../config/notion');

// GET /balance - Get balances for all accounts from "Current Status" property
router.get('/', async (req, res) => {
    try {
        if (!ACCOUNTS_DB_ID) {
            return res.json({ 
                accounts: [],
                message: 'ACCOUNTS_DB_ID not configured'
            });
        }

        // Get accounts database schema
        const accountsDb = await notion.databases.retrieve({ database_id: ACCOUNTS_DB_ID });
        
        // Find property names
        let nameProperty = 'Name';
        let balanceProperty = 'Current Status';
        
        // Find title property
        for (const [key, value] of Object.entries(accountsDb.properties)) {
            if (value.type === 'title') {
                nameProperty = key;
                break;
            }
        }
        
        // Verify "Current Status" property exists
        if (!accountsDb.properties['Current Status']) {
            // Try to find it by type (could be number, formula, etc.)
            for (const [key, value] of Object.entries(accountsDb.properties)) {
                const lowerKey = key.toLowerCase();
                if ((lowerKey.includes('status') || lowerKey.includes('balance') || lowerKey.includes('current')) 
                    && (value.type === 'number' || value.type === 'formula')) {
                    balanceProperty = key;
                    break;
                }
            }
        }

        // Get all accounts
        let accountsResponse;
        try {
            accountsResponse = await notion.databases.query({
                database_id: ACCOUNTS_DB_ID,
                sorts: [
                    {
                        property: nameProperty,
                        direction: 'ascending'
                    }
                ]
            });
        } catch (sortError) {
            console.warn('Account sorting failed, fetching without sort:', sortError.message);
            accountsResponse = await notion.databases.query({
                database_id: ACCOUNTS_DB_ID
            });
        }

        // Get transactions database schema for last transaction lookup
        const transactionsDb = await notion.databases.retrieve({ database_id: TRANSACTIONS_DB_ID });
        
        // Find transaction property names
        let accountPropertyName = null;
        let amountPropertyName = null;
        let typePropertyName = null;
        let datePropertyName = null;
        
        // Try exact matches first
        if (transactionsDb.properties['Linked Account']) accountPropertyName = 'Linked Account';
        if (transactionsDb.properties['Amount']) amountPropertyName = 'Amount';
        if (transactionsDb.properties['Transaction Type']) typePropertyName = 'Transaction Type';
        if (transactionsDb.properties['Date']) datePropertyName = 'Date';
        
        // Fallback to type detection
        for (const [key, value] of Object.entries(transactionsDb.properties)) {
            if (value.type === 'number' && !amountPropertyName) {
                amountPropertyName = key;
            } else if (value.type === 'select' && !typePropertyName) {
                typePropertyName = key;
            } else if (value.type === 'date' && !datePropertyName) {
                datePropertyName = key;
            } else if (value.type === 'relation') {
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('account') && !accountPropertyName) {
                    accountPropertyName = key;
                }
            }
        }
        
        // Final fallback
        if (!accountPropertyName) accountPropertyName = 'Linked Account';
        if (!amountPropertyName) amountPropertyName = 'Amount';
        if (!typePropertyName) typePropertyName = 'Transaction Type';
        if (!datePropertyName) datePropertyName = 'Date';

        // Process each account
        const accountBalances = await Promise.all(accountsResponse.results.map(async (accountPage) => {
            try {
                // Get balance from "Current Status" property
                const balanceProp = accountPage.properties[balanceProperty];
                let balance = 0;
                
                // Handle different property types
                if (balanceProp?.type === 'number') {
                    balance = balanceProp.number || 0;
                } else if (balanceProp?.type === 'formula') {
                    // Formula can return number or string
                    if (balanceProp.formula?.type === 'number') {
                        balance = balanceProp.formula.number || 0;
                    } else if (balanceProp.formula?.type === 'string') {
                        // Try to parse string to number (remove currency symbols, etc.)
                        const balanceStr = balanceProp.formula.string || '0';
                        balance = parseFloat(balanceStr.replace(/[^0-9.-]/g, '')) || 0;
                    }
                } else if (balanceProp?.type === 'rich_text') {
                    // If it's text, try to parse it
                    const balanceText = balanceProp.rich_text?.[0]?.plain_text || '0';
                    balance = parseFloat(balanceText.replace(/[^0-9.-]/g, '')) || 0;
                }

                // Get last transaction for "Last:" display
                let lastTransaction = null;
                try {
                    const lastTransactionResponse = await notion.databases.query({
                        database_id: TRANSACTIONS_DB_ID,
                        filter: {
                            property: accountPropertyName,
                            relation: {
                                contains: accountPage.id
                            }
                        },
                        sorts: [
                            {
                                property: datePropertyName,
                                direction: 'descending'
                            }
                        ],
                        page_size: 1
                    });

                    if (lastTransactionResponse.results.length > 0) {
                        const lastPage = lastTransactionResponse.results[0];
                        const amount = lastPage.properties[amountPropertyName]?.number || 0;
                        const typeProp = lastPage.properties[typePropertyName];
                        
                        let transactionType = 'expense';
                        if (typeProp?.select) {
                            const typeName = typeProp.select.name.toLowerCase();
                            if (typeName.includes('income')) {
                                transactionType = 'income';
                            } else if (typeName.includes('expense')) {
                                transactionType = 'expense';
                            }
                        }
                        
                        lastTransaction = {
                            amount: amount,
                            type: transactionType
                        };
                    }
                } catch (error) {
                    console.warn(`Error fetching last transaction for account:`, error.message);
                }

                return {
                    id: accountPage.id,
                    name: accountPage.properties[nameProperty]?.title?.[0]?.plain_text || 'Unnamed Account',
                    balance: parseFloat(balance.toFixed(2)),
                    lastTransaction: lastTransaction
                };
            } catch (error) {
                console.error(`Error processing account:`, error);
                return {
                    id: accountPage.id,
                    name: accountPage.properties[nameProperty]?.title?.[0]?.plain_text || 'Unnamed Account',
                    balance: 0,
                    lastTransaction: null
                };
            }
        }));

        res.json({ accounts: accountBalances });
    } catch (error) {
        console.error('Error fetching balances:', error);
        res.status(500).json({ 
            error: 'Failed to fetch balances',
            details: error.message 
        });
    }
});

module.exports = router;

