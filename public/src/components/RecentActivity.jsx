const React = require('react');
const { formatCurrency, formatDate } = require('../utils/formatters');

function RecentActivity({ transactions, isExpanded, onToggle }) {
    return React.createElement('div', {
        className: 'recent-activity'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'recent-activity-header',
            id: 'recentActivityToggle',
            onClick: onToggle,
            style: { cursor: 'pointer', userSelect: 'none' }
        }, [
            React.createElement('h3', { key: 'title' }, 'Recent Activity'),
            React.createElement('span', {
                key: 'icon',
                className: `toggle-icon ${isExpanded ? '' : 'collapsed'}`,
                id: 'toggleIcon'
            }, '▼')
        ]),
        React.createElement('div', {
            key: 'content',
            className: `recent-activity-content ${isExpanded ? 'visible' : 'hidden'}`,
            id: 'recentActivityContent'
        }, transactions.length === 0 
            ? React.createElement('div', {
                style: { textAlign: 'center', color: '#888', padding: '20px' }
            }, 'No transactions yet')
            : transactions.map((tx, index) => {
                const formattedAmount = formatCurrency(Math.abs(tx.amount));
                const sign = tx.type === 'income' ? '+' : '-';
                const amountClass = tx.type === 'expense' ? 'expense' : 'income';

                return React.createElement('div', {
                    key: index,
                    className: 'transaction-item'
                }, [
                    React.createElement('div', { key: 'info' }, [
                        React.createElement('div', {
                            key: 'name',
                            className: 'transaction-name'
                        }, tx.name),
                        React.createElement('div', {
                            key: 'date',
                            className: 'transaction-date'
                        }, formatDate(tx.date))
                    ]),
                    React.createElement('div', {
                        key: 'amount',
                        className: `transaction-amount ${amountClass}`
                    }, `${sign}${formattedAmount}`)
                ]);
            })
        )
    ]);
}

module.exports = RecentActivity;
