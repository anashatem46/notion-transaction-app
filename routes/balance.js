const express = require('express');
const router = express.Router();
const { notion, TRANSACTIONS_DB_ID, ACCOUNTS_DB_ID } = require('../config/notion');

// GET /balance - Get balances for all accounts
router.get('/', async (req, res) => {
    try {
        if (!ACCOUNTS_DB_ID) {
            return res.json({ 
                accounts: [],
                message: 'ACCOUNTS_DB_ID not configured'
            });
        }

        // Get accounts database schema to find name property
        const accountsDb = await notion.databases.retrieve({ database_id: ACCOUNTS_DB_ID });
        let nameProperty = 'Name';
        for (const [key, value] of Object.entries(accountsDb.properties)) {
            if (value.type === 'title') {
                nameProperty = key;
                break;
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
            // If sorting fails, fetch without sort
            console.warn('Account sorting failed, fetching without sort:', sortError.message);
            accountsResponse = await notion.databases.query({
                database_id: ACCOUNTS_DB_ID
            });
        }

        // Get the transactions database schema
        const database = await notion.databases.retrieve({ database_id: TRANSACTIONS_DB_ID });
        
        // Find property names
        let accountPropertyName = null;
        let amountPropertyName = null;
        let typePropertyName = null;
        let datePropertyName = null;
        let titlePropertyName = null;
        
        // Try exact matches first
        if (database.properties['Linked Account']) accountPropertyName = 'Linked Account';
        if (database.properties['Amount']) amountPropertyName = 'Amount';
        if (database.properties['Transaction Type']) typePropertyName = 'Transaction Type';
        if (database.properties['Date']) datePropertyName = 'Date';
        if (database.properties['Transaction Name']) titlePropertyName = 'Transaction Name';
        
        // Fallback to type detection
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
        if (!titlePropertyName) titlePropertyName = 'Transaction Name';
        
        const accounts = accountsResponse.results.map(page => ({
            id: page.id,
            name: page.properties[nameProperty]?.title?.[0]?.plain_text || 'Unnamed Account'
        }));

        // Calculate balance and last transaction for each account
        const accountBalances = await Promise.all(accounts.map(async (account) => {
            try {
                // Query transactions for this account
                const transactionsResponse = await notion.databases.query({
                    database_id: TRANSACTIONS_DB_ID,
                    filter: {
                        property: accountPropertyName,
                        relation: {
                            contains: account.id
                        }
                    },
                    sorts: [
                        {
                            property: datePropertyName,
                            direction: 'descending'
                        }
                    ],
                    page_size: 1 // Get most recent for "last transaction"
                });

                // Get all transactions for balance calculation
                const allTransactionsResponse = await notion.databases.query({
                    database_id: TRANSACTIONS_DB_ID,
                    filter: {
                        property: accountPropertyName,
                        relation: {
                            contains: account.id
                        }
                    }
                });

                // Calculate balance
                let balance = 0;
                for (const page of allTransactionsResponse.results) {
                    const amount = page.properties[amountPropertyName]?.number || 0;
                    const typeProp = page.properties[typePropertyName];
                    
                    let transactionType = '';
                    if (typeProp?.select) {
                        transactionType = typeProp.select.name.toLowerCase();
                    }
                    
                    if (transactionType.includes('income')) {
                        balance += amount;
                    } else if (transactionType.includes('expense')) {
                        balance -= amount;
                    }
                }

                // Get last transaction
                let lastTransaction = null;
                if (transactionsResponse.results.length > 0) {
                    const lastPage = transactionsResponse.results[0];
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

                return {
                    id: account.id,
                    name: account.name,
                    balance: parseFloat(balance.toFixed(2)),
                    lastTransaction: lastTransaction
                };
            } catch (error) {
                console.error(`Error processing account ${account.name}:`, error);
                return {
                    id: account.id,
                    name: account.name,
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

