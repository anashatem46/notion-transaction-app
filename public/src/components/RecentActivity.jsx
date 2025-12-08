const React = require('react');
const { formatCurrency, formatDate } = require('../utils/formatters');

function RecentActivity({ transactions, isExpanded, onToggle }) {
    return React.createElement('div', {
        className: 'mt-8 pt-6 border-t-2 border-gray-200'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'flex justify-between items-center mb-4 cursor-pointer select-none hover:opacity-80',
            onClick: onToggle
        }, [
            React.createElement('h3', { 
                key: 'title',
                className: 'text-gray-800 text-xl font-semibold m-0'
            }, 'Recent Activity'),
            React.createElement('span', {
                key: 'icon',
                className: `text-lg text-primary transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`,
            }, '▼')
        ]),
        React.createElement('div', {
            key: 'content',
            className: `transition-all duration-300 overflow-hidden ${
                isExpanded 
                    ? 'max-h-[1000px] opacity-100' 
                    : 'max-h-0 opacity-0 m-0'
            }`
        }, transactions.length === 0 
            ? React.createElement('div', {
                className: 'text-center text-gray-400 p-5'
            }, 'No transactions yet')
            : transactions.map((tx, index) => {
                const formattedAmount = formatCurrency(Math.abs(tx.amount));
                const sign = tx.type === 'income' ? '+' : '-';
                const amountClass = tx.type === 'expense' ? 'text-red-500' : 'text-green-500';

                return React.createElement('div', {
                    key: index,
                    className: 'flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0'
                }, [
                    React.createElement('div', { key: 'info' }, [
                        React.createElement('div', {
                            key: 'name',
                            className: 'font-semibold text-gray-800 mb-1'
                        }, tx.name),
                        React.createElement('div', {
                            key: 'date',
                            className: 'text-sm text-gray-400'
                        }, formatDate(tx.date))
                    ]),
                    React.createElement('div', {
                        key: 'amount',
                        className: `text-lg font-bold ${amountClass}`
                    }, `${sign}${formattedAmount}`)
                ]);
            })
        )
    ]);
}

module.exports = RecentActivity;
