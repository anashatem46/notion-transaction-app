const express = require('express');
const router = express.Router();
const { notion, TRANSACTIONS_DB_ID } = require('../config/notion');

// Helper function to fetch all pages from a Notion query
async function fetchAllPages(queryFn) {
    const allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await queryFn(startCursor);
        allResults.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
    }

    return allResults;
}

// GET /recent-transactions - Get 5 most recent transactions
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        // Get the database schema to find property names
        const database = await notion.databases.retrieve({ database_id: TRANSACTIONS_DB_ID });
        
        // Find property names
        let titlePropertyName = null;
        let amountPropertyName = null;
        let typePropertyName = null;
        let datePropertyName = null;
        
        // Try exact matches first
        if (database.properties['Transaction Name']) titlePropertyName = 'Transaction Name';
        if (database.properties['Amount']) amountPropertyName = 'Amount';
        if (database.properties['Transaction Type']) typePropertyName = 'Transaction Type';
        if (database.properties['Date']) datePropertyName = 'Date';
        
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
            }
        }
        
        // Final fallback
        if (!titlePropertyName) titlePropertyName = 'Transaction Name';
        if (!amountPropertyName) amountPropertyName = 'Amount';
        if (!typePropertyName) typePropertyName = 'Transaction Type';
        if (!datePropertyName) datePropertyName = 'Date';

        // Query recent transactions sorted by date
        let response;
        try {
            // Try with sorting first
            response = await notion.databases.query({
                database_id: TRANSACTIONS_DB_ID,
                sorts: [
                    {
                        property: datePropertyName,
                        direction: 'descending'
                    }
                ],
                page_size: limit
            });
        } catch (sortError) {
            // If sorting fails, query without sort and sort manually
            console.warn('Date sorting failed, fetching without sort:', sortError.message);
            response = await notion.databases.query({
                database_id: TRANSACTIONS_DB_ID,
                page_size: 100 // Get more to sort manually
            });
        }

        // Format transactions
        let transactions = response.results.map(page => {
            const titleProp = page.properties[titlePropertyName];
            const amount = page.properties[amountPropertyName]?.number || 0;
            const typeProp = page.properties[typePropertyName];
            const dateProp = page.properties[datePropertyName]?.date;
            
            // Get transaction type
            let transactionType = 'expense';
            if (typeProp?.select) {
                const typeName = typeProp.select.name.toLowerCase();
                if (typeName.includes('income')) {
                    transactionType = 'income';
                } else if (typeName.includes('expense')) {
                    transactionType = 'expense';
                }
            }
            
            // Get date
            let date = null;
            let dateTimestamp = 0;
            if (dateProp?.start) {
                date = new Date(dateProp.start);
                dateTimestamp = date.getTime();
            }
            
            return {
                name: titleProp?.title?.[0]?.plain_text || 'Unnamed Transaction',
                amount: amount,
                type: transactionType,
                date: date ? date.toISOString().split('T')[0] : null,
                _sortDate: dateTimestamp // For manual sorting
            };
        });

        // Sort manually if needed (by date descending, then limit)
        transactions.sort((a, b) => b._sortDate - a._sortDate);
        transactions = transactions.slice(0, limit);
        
        // Remove sort helper
        transactions = transactions.map(({ _sortDate, ...rest }) => rest);

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch recent transactions',
            details: error.message 
        });
    }
});

module.exports = router;

