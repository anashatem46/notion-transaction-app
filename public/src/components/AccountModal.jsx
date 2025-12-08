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
            return;
        }
        onSave(selectedAccountIds);
    };

    return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-5',
        onClick: handleOverlayClick
    }, React.createElement('div', {
        className: 'bg-white rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl animate-modal-slide-in'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'flex justify-between items-center mb-6'
        }, [
            React.createElement('h2', { 
                key: 'title',
                className: 'text-gray-800 text-2xl font-semibold m-0'
            }, 'Select Accounts'),
            React.createElement('button', {
                key: 'close',
                className: 'bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors',
                onClick: onClose
            }, '×')
        ]),
        React.createElement('div', {
            key: 'description',
            className: 'text-gray-600 mb-5 text-sm'
        }, 'Select exactly 2 accounts to display in quick view tabs.'),
        React.createElement('div', {
            key: 'warning',
            id: 'selectionWarning',
            className: 'bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 mb-5 text-yellow-800 text-sm hidden animate-shake',
            style: { display: 'none' }
        }, 'You can only select 2 accounts. Please deselect one before selecting another.'),
        React.createElement('div', {
            key: 'list',
            className: 'flex flex-col mb-6'
        }, accounts.map(account => {
            const isSelected = selectedAccountIds.includes(account.id);
            const formattedBalance = formatCurrency(account.balance);

            return React.createElement('div', {
                key: account.id,
                className: `flex items-center p-4 mb-3 rounded-lg cursor-pointer transition-all duration-200 w-full ${
                    isSelected 
                        ? 'border-2 border-primary bg-blue-50' 
                        : 'border-2 border-gray-200 hover:border-accent hover:bg-gray-50'
                }`,
                'data-account-id': account.id,
                onClick: () => onToggleAccount(account.id)
            }, [
                React.createElement('div', {
                    key: 'checkbox',
                    className: `w-6 h-6 border-2 rounded flex items-center justify-center flex-shrink-0 mr-3 transition-all ${
                        isSelected 
                            ? 'bg-primary border-primary' 
                            : 'border-primary'
                    }`
                }, isSelected ? React.createElement('span', {
                    className: 'text-white text-base font-bold'
                }, '✓') : null),
                React.createElement('div', {
                    key: 'info',
                    className: 'flex-1'
                }, [
                    React.createElement('div', {
                        key: 'name',
                        className: 'font-semibold text-gray-800 mb-1'
                    }, account.name),
                    React.createElement('div', {
                        key: 'balance',
                        className: 'text-sm text-gray-600'
                    }, formattedBalance)
                ])
            ]);
        })),
        React.createElement('div', {
            key: 'actions',
            className: 'flex flex-row gap-3 justify-end items-center flex-wrap'
        }, [
            React.createElement('button', {
                key: 'cancel',
                type: 'button',
                className: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 md:py-3 md:px-6 rounded-lg transition-colors duration-200 flex-shrink-0 whitespace-nowrap text-sm md:text-base',
                onClick: onClose
            }, 'Cancel'),
            React.createElement('button', {
                key: 'save',
                type: 'button',
                className: 'bg-primary hover:bg-primary-light text-white font-semibold py-2.5 px-4 md:py-3 md:px-6 rounded-lg transition-colors duration-200 flex-shrink-0 whitespace-nowrap text-sm md:text-base',
                onClick: handleSave
            }, 'Save Changes')
        ])
    ]));
}

module.exports = AccountModal;
