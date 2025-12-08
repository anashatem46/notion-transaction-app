const React = require('react');
const { formatCurrency } = require('../utils/formatters');

function AccountTabs({ accounts, selectedAccountId, onAccountSelect }) {
    if (!accounts || accounts.length === 0) {
        return React.createElement('div', {
            className: 'text-center text-gray-400 p-5'
        }, 'Loading accounts...');
    }

    return React.createElement('div', {
        className: 'flex gap-3 flex-wrap w-full'
    }, accounts.map((account, index) => {
        const isActive = selectedAccountId === account.id || (index === 0 && !selectedAccountId);
        const formattedBalance = formatCurrency(account.balance);
        
        let lastTransactionHtml = null;
        if (account.lastTransaction) {
            const formattedLast = formatCurrency(Math.abs(account.lastTransaction.amount));
            const sign = account.lastTransaction.type === 'income' ? '+' : '-';
            lastTransactionHtml = React.createElement('div', {
                className: `text-xs ${isActive ? 'text-white opacity-85' : 'text-gray-500'}`
            }, `Last: ${sign}${formattedLast}`);
        } else {
            lastTransactionHtml = React.createElement('div', {
                className: `text-xs ${isActive ? 'text-white opacity-85' : 'text-gray-500'}`
            }, 'No transactions');
        }

        return React.createElement('div', {
            key: account.id,
            className: `flex-1 min-w-[120px] sm:min-w-[150px] p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                    ? 'bg-primary text-white border-2 border-primary' 
                    : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-accent hover:shadow-md'
            }`,
            'data-account-id': account.id,
            onClick: () => onAccountSelect && onAccountSelect(account.id)
        }, [
            React.createElement('div', {
                key: 'name',
                className: `font-semibold text-sm mb-1.5 ${isActive ? 'text-white' : 'text-gray-800'}`
            }, account.name),
            React.createElement('div', {
                key: 'balance',
                className: `text-xl font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-800'}`
            }, formattedBalance),
            lastTransactionHtml
        ]);
    }));
}

module.exports = AccountTabs;
