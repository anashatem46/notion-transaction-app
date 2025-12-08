const { ACCOUNTS_DB_ID, TRANSACTIONS_DB_ID } = require('../config/notion');
const notionService = require('./notionService');

/**
 * Get balances for all accounts
 */
async function getAccountBalances() {
    if (!ACCOUNTS_DB_ID) {
        return {
            accounts: [],
            message: 'ACCOUNTS_DB_ID not configured'
        };
    }

    // Get account properties
    const accountProperties = await notionService.getAccountProperties(ACCOUNTS_DB_ID);
    const transactionProperties = await notionService.getTransactionProperties(TRANSACTIONS_DB_ID);

    // Get all accounts
    const accountsResponse = await notionService.queryDatabaseWithSort(ACCOUNTS_DB_ID, {
        sortProperty: accountProperties.title,
        sortDirection: 'ascending'
    });

    // Process each account
    const accountBalances = await Promise.all(
        accountsResponse.results.map(async (accountPage) => {
            try {
                // Get balance from balance property
                const balance = notionService.extractBalance(accountPage, accountProperties.balance);

                // Get last transaction for "Last:" display
                let lastTransaction = null;
                try {
                    const lastTransactionResponse = await notionService.queryDatabaseWithSort(
                        TRANSACTIONS_DB_ID,
                        {
                            sortProperty: transactionProperties.date,
                            sortDirection: 'descending',
                            pageSize: 100
                        }
                    );

                    // Find first transaction for this account
                    const lastPage = lastTransactionResponse.results.find(page => {
                        const accountRelation = page.properties[transactionProperties.account]?.relation || [];
                        return accountRelation.some(rel => rel.id === accountPage.id);
                    });

                    if (lastPage) {
                        const amount = notionService.extractNumber(lastPage, transactionProperties.amount);
                        const typeProperty = lastPage.properties[transactionProperties.type];
                        const transactionType = notionService.determineTransactionType(typeProperty);

                        lastTransaction = {
                            amount: amount,
                            type: transactionType
                        };
                    }
                } catch (error) {
                    console.warn(`Error fetching last transaction for account:`, error.message);
                }

                const name = notionService.extractTitle(accountPage, accountProperties.title);

                return {
                    id: accountPage.id,
                    name: name || 'Unnamed Account',
                    balance: balance,
                    lastTransaction: lastTransaction
                };
            } catch (error) {
                console.error(`Error processing account:`, error);
                const name = notionService.extractTitle(accountPage, accountProperties.title);
                return {
                    id: accountPage.id,
                    name: name || 'Unnamed Account',
                    balance: 0,
                    lastTransaction: null
                };
            }
        })
    );

    return { accounts: accountBalances };
}

module.exports = {
    getAccountBalances
};
