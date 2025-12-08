const React = require('react');
const { formatCurrency } = require('../utils/formatters');

function AccountModal({ isOpen, accounts, selectedAccountIds, onClose, onSave, onToggleAccount }) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSave = () => {
        if (selectedAccountIds.length !== 2) {
            // Show warning - would need state management for this
            return;
        }
        onSave(selectedAccountIds);
    };

    return React.createElement('div', {
        className: 'modal-overlay show',
        onClick: handleOverlayClick
    }, React.createElement('div', {
        className: 'modal'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'modal-header'
        }, [
            React.createElement('h2', { key: 'title' }, 'Select Accounts'),
            React.createElement('button', {
                key: 'close',
                className: 'modal-close',
                onClick: onClose
            }, '×')
        ]),
        React.createElement('div', {
            key: 'description',
            className: 'modal-description'
        }, 'Select exactly 2 accounts to display in quick view tabs.'),
        React.createElement('div', {
            key: 'warning',
            id: 'selectionWarning',
            className: 'selection-warning',
            style: { display: 'none' }
        }, 'You can only select 2 accounts. Please deselect one before selecting another.'),
        React.createElement('div', {
            key: 'list',
            className: 'account-list',
            id: 'accountList'
        }, accounts.map(account => {
            const isSelected = selectedAccountIds.includes(account.id);
            const formattedBalance = formatCurrency(account.balance);

            return React.createElement('div', {
                key: account.id,
                className: `account-item ${isSelected ? 'selected' : ''}`,
                'data-account-id': account.id,
                onClick: () => onToggleAccount(account.id)
            }, [
                React.createElement('div', {
                    key: 'checkbox',
                    className: 'account-checkbox'
                }),
                React.createElement('div', {
                    key: 'info',
                    className: 'account-item-info'
                }, [
                    React.createElement('div', {
                        key: 'name',
                        className: 'account-item-name'
                    }, account.name),
                    React.createElement('div', {
                        key: 'balance',
                        className: 'account-item-balance'
                    }, formattedBalance)
                ])
            ]);
        })),
        React.createElement('div', {
            key: 'actions',
            className: 'modal-actions'
        }, [
            React.createElement('button', {
                key: 'cancel',
                type: 'button',
                className: 'btn-cancel',
                onClick: onClose
            }, 'Cancel'),
            React.createElement('button', {
                key: 'save',
                type: 'button',
                className: 'btn-save',
                onClick: handleSave
            }, 'Save Changes')
        ])
    ]));
}

module.exports = AccountModal;
