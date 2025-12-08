const React = require('react');
const { getTodayDate } = require('../utils/formatters');

function TransactionForm({ 
    categories, 
    accounts, 
    onSubmit, 
    isLoading 
}) {
    const [formData, setFormData] = React.useState({
        name: '',
        amount: '',
        type: 'Expense',
        date: getTodayDate(),
        account: '',
        category: '',
        note: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return React.createElement('form', {
        id: 'transactionForm',
        onSubmit: handleSubmit
    }, [
        React.createElement('div', {
            key: 'name',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'name'
            }, ['Transaction Name ', React.createElement('span', {
                key: 'required',
                className: 'required'
            }, '*')]),
            React.createElement('input', {
                key: 'input',
                type: 'text',
                id: 'name',
                name: 'name',
                required: true,
                placeholder: 'e.g., Grocery shopping',
                value: formData.name,
                onChange: (e) => handleChange('name', e.target.value)
            })
        ]),
        React.createElement('div', {
            key: 'amount',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'amount'
            }, ['Amount ', React.createElement('span', {
                key: 'required',
                className: 'required'
            }, '*')]),
            React.createElement('input', {
                key: 'input',
                type: 'number',
                id: 'amount',
                name: 'amount',
                step: '0.01',
                min: '0',
                required: true,
                placeholder: '0.00',
                value: formData.amount,
                onChange: (e) => handleChange('amount', e.target.value)
            })
        ]),
        React.createElement('div', {
            key: 'type',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label'
            }, ['Transaction Type ', React.createElement('span', {
                key: 'required',
                className: 'required'
            }, '*')]),
            React.createElement('div', {
                key: 'toggle',
                className: 'toggle-group'
            }, [
                React.createElement('div', {
                    key: 'expense',
                    className: `toggle-option expense ${formData.type === 'Expense' ? 'active' : ''}`,
                    'data-type': 'Expense',
                    onClick: () => handleChange('type', 'Expense')
                }, '💸 Expense'),
                React.createElement('div', {
                    key: 'income',
                    className: `toggle-option income ${formData.type === 'Income' ? 'active' : ''}`,
                    'data-type': 'Income',
                    onClick: () => handleChange('type', 'Income')
                }, '💰 Income')
            ]),
            React.createElement('input', {
                key: 'hidden',
                type: 'hidden',
                id: 'type',
                name: 'type',
                value: formData.type
            })
        ]),
        React.createElement('div', {
            key: 'date',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'date'
            }, ['Date ', React.createElement('span', {
                key: 'required',
                className: 'required'
            }, '*')]),
            React.createElement('input', {
                key: 'input',
                type: 'date',
                id: 'date',
                name: 'date',
                required: true,
                value: formData.date,
                onChange: (e) => handleChange('date', e.target.value)
            })
        ]),
        React.createElement('div', {
            key: 'account',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'account'
            }, ['Account ', React.createElement('span', {
                key: 'required',
                className: 'required'
            }, '*')]),
            React.createElement('select', {
                key: 'select',
                id: 'account',
                name: 'account',
                required: true,
                value: formData.account,
                onChange: (e) => handleChange('account', e.target.value)
            }, [
                React.createElement('option', {
                    key: 'default',
                    value: ''
                }, accounts.length === 0 ? 'Loading accounts...' : 'Select an account'),
                ...accounts.map(acc => React.createElement('option', {
                    key: acc.id,
                    value: acc.id
                }, acc.name))
            ])
        ]),
        React.createElement('div', {
            key: 'category',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'category'
            }, ['Category ', React.createElement('span', {
                key: 'required',
                className: 'required'
            }, '*')]),
            React.createElement('select', {
                key: 'select',
                id: 'category',
                name: 'category',
                required: true,
                value: formData.category,
                onChange: (e) => handleChange('category', e.target.value)
            }, [
                React.createElement('option', {
                    key: 'default',
                    value: ''
                }, categories.length === 0 ? 'Loading categories...' : 'Select a category'),
                ...categories.map(cat => React.createElement('option', {
                    key: cat.id,
                    value: cat.id
                }, cat.name))
            ])
        ]),
        React.createElement('div', {
            key: 'note',
            className: 'form-group'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'note'
            }, 'Note (Optional)'),
            React.createElement('textarea', {
                key: 'textarea',
                id: 'note',
                name: 'note',
                placeholder: 'Add any additional details...',
                value: formData.note,
                onChange: (e) => handleChange('note', e.target.value)
            })
        ]),
        React.createElement('button', {
            key: 'submit',
            type: 'submit',
            className: 'btn-submit',
            id: 'submitBtn',
            disabled: isLoading
        }, isLoading ? 'Saving...' : 'Save')
    ]);
}

module.exports = TransactionForm;
