const React = require('react');
const { formatCurrency } = require('../utils/formatters');

function AccountTabs({ accounts, selectedAccountId, onAccountSelect }) {
    if (!accounts || accounts.length === 0) {
        return React.createElement('div', {
            style: { textAlign: 'center', color: '#888', padding: '20px' }
        }, 'Loading accounts...');
    }

    return React.createElement('div', {
        className: 'accounts-tabs',
        id: 'accountsTabs'
    }, accounts.map((account, index) => {
        const isActive = selectedAccountId === account.id || (index === 0 && !selectedAccountId);
        const formattedBalance = formatCurrency(account.balance);
        
        let lastTransactionHtml = null;
        if (account.lastTransaction) {
            const formattedLast = formatCurrency(Math.abs(account.lastTransaction.amount));
            const sign = account.lastTransaction.type === 'income' ? '+' : '-';
            lastTransactionHtml = React.createElement('div', {
                className: 'account-tab-last'
            }, `Last: ${sign}${formattedLast}`);
        } else {
            lastTransactionHtml = React.createElement('div', {
                className: 'account-tab-last'
            }, 'No transactions');
        }

        return React.createElement('div', {
            key: account.id,
            className: `account-tab ${isActive ? 'active' : ''}`,
            'data-account-id': account.id,
            onClick: () => onAccountSelect && onAccountSelect(account.id)
        }, [
            React.createElement('div', {
                key: 'name',
                className: 'account-tab-name'
            }, account.name),
            React.createElement('div', {
                key: 'balance',
                className: 'account-tab-balance'
            }, formattedBalance),
            lastTransactionHtml
        ]);
    }));
}

module.exports = AccountTabs;
