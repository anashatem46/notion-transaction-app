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
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            // Clear category when switching from Expense to Income
            if (field === 'type' && value === 'Income' && prev.type === 'Expense') {
                updated.category = '';
            }
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return React.createElement('form', {
        onSubmit: handleSubmit
    }, [
        React.createElement('div', {
            key: 'name',
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'name',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, ['Transaction Name ', React.createElement('span', {
                key: 'required',
                className: 'text-red-500'
            }, '*')]),
            React.createElement('input', {
                key: 'input',
                type: 'text',
                id: 'name',
                name: 'name',
                required: true,
                placeholder: 'e.g., Grocery shopping',
                className: 'w-full border-2 border-gray-200 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-base',
                value: formData.name,
                onChange: (e) => handleChange('name', e.target.value)
            })
        ]),
        React.createElement('div', {
            key: 'amount',
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'amount',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, ['Amount ', React.createElement('span', {
                key: 'required',
                className: 'text-red-500'
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
                className: 'w-full border-2 border-gray-200 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-base',
                value: formData.amount,
                onChange: (e) => handleChange('amount', e.target.value)
            })
        ]),
        React.createElement('div', {
            key: 'type',
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, ['Transaction Type ', React.createElement('span', {
                key: 'required',
                className: 'text-red-500'
            }, '*')]),
            React.createElement('div', {
                key: 'toggle',
                className: 'flex gap-3 mt-2'
            }, [
                React.createElement('div', {
                    key: 'expense',
                    className: `flex-1 p-3 border-2 rounded-lg text-center cursor-pointer font-semibold transition-all duration-200 select-none ${
                        formData.type === 'Expense' 
                            ? 'bg-red-500 border-red-500 text-white' 
                            : 'border-gray-200 hover:border-accent'
                    }`,
                    onClick: () => handleChange('type', 'Expense')
                }, '💸 Expense'),
                React.createElement('div', {
                    key: 'income',
                    className: `flex-1 p-3 border-2 rounded-lg text-center cursor-pointer font-semibold transition-all duration-200 select-none ${
                        formData.type === 'Income' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-200 hover:border-accent'
                    }`,
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
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'date',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, ['Date ', React.createElement('span', {
                key: 'required',
                className: 'text-red-500'
            }, '*')]),
            React.createElement('input', {
                key: 'input',
                type: 'date',
                id: 'date',
                name: 'date',
                required: true,
                className: 'w-full border-2 border-gray-200 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-base',
                value: formData.date,
                onChange: (e) => handleChange('date', e.target.value)
            })
        ]),
        React.createElement('div', {
            key: 'account',
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'account',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, ['Account ', React.createElement('span', {
                key: 'required',
                className: 'text-red-500'
            }, '*')]),
            React.createElement('select', {
                key: 'select',
                id: 'account',
                name: 'account',
                required: true,
                className: 'w-full border-2 border-gray-200 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-base',
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
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'category',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, [
                'Category ',
                formData.type === 'Expense' ? React.createElement('span', {
                    key: 'required',
                    className: 'text-red-500'
                }, '*') : React.createElement('span', {
                    key: 'optional',
                    className: 'text-gray-400 text-xs font-normal'
                }, '(Optional)')
            ]),
            React.createElement('select', {
                key: 'select',
                id: 'category',
                name: 'category',
                required: formData.type === 'Expense',
                className: 'w-full border-2 border-gray-200 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-base',
                value: formData.category,
                onChange: (e) => handleChange('category', e.target.value)
            }, [
                React.createElement('option', {
                    key: 'default',
                    value: ''
                }, categories.length === 0 ? 'Loading categories...' : (formData.type === 'Income' ? 'Select a category (optional)' : 'Select a category')),
                ...categories.map(cat => React.createElement('option', {
                    key: cat.id,
                    value: cat.id
                }, cat.name))
            ])
        ]),
        React.createElement('div', {
            key: 'note',
            className: 'mb-5'
        }, [
            React.createElement('label', {
                key: 'label',
                htmlFor: 'note',
                className: 'block text-gray-600 font-semibold mb-2 text-sm'
            }, 'Note (Optional)'),
            React.createElement('textarea', {
                key: 'textarea',
                id: 'note',
                name: 'note',
                placeholder: 'Add any additional details...',
                className: 'w-full border-2 border-gray-200 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-base resize-y min-h-[80px]',
                value: formData.note,
                onChange: (e) => handleChange('note', e.target.value)
            })
        ]),
        React.createElement('button', {
            key: 'submit',
            type: 'submit',
            className: 'w-full bg-primary hover:bg-primary-light text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
            disabled: isLoading
        }, isLoading ? 'Saving...' : 'Save')
    ]);
}

module.exports = TransactionForm;
