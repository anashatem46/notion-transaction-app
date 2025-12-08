const React = require('react');
const apiService = require('./services/api');
const localStorageService = require('./services/localStorage');
const TransactionForm = require('./components/TransactionForm');
const AccountTabs = require('./components/AccountTabs');
const RecentActivity = require('./components/RecentActivity');
const AccountModal = require('./components/AccountModal');
const StatusMessage = require('./components/StatusMessage');

function App() {
    const [categories, setCategories] = React.useState([]);
    const [accounts, setAccounts] = React.useState([]);
    const [allAccounts, setAllAccounts] = React.useState([]);
    const [selectedAccountIds, setSelectedAccountIds] = React.useState([]);
    const [selectedAccountId, setSelectedAccountId] = React.useState(null);
    const [balances, setBalances] = React.useState([]);
    const [recentTransactions, setRecentTransactions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState(null);
    const [statusType, setStatusType] = React.useState('success');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalSelectedIds, setModalSelectedIds] = React.useState([]);
    const [isRecentActivityExpanded, setIsRecentActivityExpanded] = React.useState(false);

    // Initialize selected accounts from localStorage
    React.useEffect(() => {
        const stored = localStorageService.getSelectedAccountIds();
        if (stored && stored.length === 2) {
            setSelectedAccountIds(stored);
        }
    }, []);

    // Load initial data
    React.useEffect(() => {
        loadCategories();
        loadAccounts();
        loadBalances();
        loadRecentTransactions();
    }, []);

    // Load balances when selected accounts change
    React.useEffect(() => {
        if (selectedAccountIds.length > 0) {
            loadBalances();
        }
    }, [selectedAccountIds]);

    const loadCategories = async () => {
        try {
            const data = await apiService.getCategories();
            setCategories(data);
        } catch (error) {
            showStatus(`Failed to load categories: ${error.message}`, 'error');
        }
    };

    const loadAccounts = async () => {
        try {
            const data = await apiService.getAccounts();
            setAccounts(data);
            setAllAccounts(data);
            
            // Initialize selected accounts if not set
            if (selectedAccountIds.length === 0) {
                initializeDefaultSelection(data);
            }
        } catch (error) {
            showStatus(`Failed to load accounts: ${error.message}`, 'error');
        }
    };

    const initializeDefaultSelection = (accountsList) => {
        const stored = localStorageService.getSelectedAccountIds();
        if (stored && stored.length === 2) {
            const validIds = stored.filter(id => accountsList.some(acc => acc.id === id));
            if (validIds.length === 2) {
                setSelectedAccountIds(validIds);
                return;
            }
        }

        // Try to find "Checking" and "Savings"
        const checking = accountsList.find(acc => 
            acc.name.toLowerCase().includes('checking')
        );
        const savings = accountsList.find(acc => 
            acc.name.toLowerCase().includes('savings')
        );

        if (checking && savings) {
            const ids = [checking.id, savings.id];
            setSelectedAccountIds(ids);
            localStorageService.setSelectedAccountIds(ids);
        } else if (accountsList.length >= 2) {
            const ids = [accountsList[0].id, accountsList[1].id];
            setSelectedAccountIds(ids);
            localStorageService.setSelectedAccountIds(ids);
        } else if (accountsList.length === 1) {
            const ids = [accountsList[0].id];
            setSelectedAccountIds(ids);
            localStorageService.setSelectedAccountIds(ids);
        }
    };

    const loadBalances = async () => {
        try {
            const data = await apiService.getBalances();
            const accountsData = data.accounts || [];
            setAllAccounts(accountsData);
            
            // Filter to selected accounts
            if (selectedAccountIds.length > 0) {
                const filtered = accountsData.filter(acc => 
                    selectedAccountIds.includes(acc.id)
                );
                setBalances(filtered);
            } else {
                setBalances(accountsData);
            }
        } catch (error) {
            showStatus(`Failed to load balances: ${error.message}`, 'error');
        }
    };

    const loadRecentTransactions = async () => {
        try {
            const data = await apiService.getRecentTransactions(5);
            setRecentTransactions(data);
        } catch (error) {
            showStatus(`Failed to load recent transactions: ${error.message}`, 'error');
        }
    };

    const handleTransactionSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await apiService.createTransaction({
                name: formData.name.trim(),
                amount: parseFloat(formData.amount),
                type: formData.type,
                date: formData.date,
                account: formData.account,
                category: formData.category,
                note: formData.note.trim()
            });

            showStatus('Transaction saved successfully! ✓', 'success');
            
            // Reload data
            loadBalances();
            loadRecentTransactions();
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
            window.location.href = '/login';
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        }
    };

    const handleCustomizeClick = () => {
        setModalSelectedIds([...selectedAccountIds]);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalToggleAccount = (accountId) => {
        setModalSelectedIds(prev => {
            if (prev.includes(accountId)) {
                return prev.filter(id => id !== accountId);
            } else {
                if (prev.length >= 2) {
                    // Show warning - would need better state management
                    return prev;
                }
                return [...prev, accountId];
            }
        });
    };

    const handleModalSave = (accountIds) => {
        if (accountIds.length !== 2) {
            showStatus('Please select exactly 2 accounts', 'error');
            return;
        }
        setSelectedAccountIds(accountIds);
        localStorageService.setSelectedAccountIds(accountIds);
        setIsModalOpen(false);
        loadBalances();
    };

    const showStatus = (message, type = 'success') => {
        setStatusMessage(message);
        setStatusType(type);
        setTimeout(() => {
            setStatusMessage(null);
        }, 5000);
    };

    return React.createElement('div', { className: 'container' }, [
        React.createElement('div', {
            key: 'header',
            className: 'header'
        }, [
            React.createElement('h1', { key: 'title' }, 'Add Transaction'),
            React.createElement('button', {
                key: 'logout',
                type: 'button',
                className: 'logout-btn',
                id: 'logoutBtn',
                onClick: handleLogout
            }, 'Log Out')
        ]),
        React.createElement('div', {
            key: 'balance',
            className: 'balance-section'
        }, [
            React.createElement('div', {
                key: 'balance-header',
                className: 'balance-header'
            }, [
                React.createElement('h2', { key: 'title' }, 'Balance'),
                React.createElement('button', {
                    key: 'customize',
                    type: 'button',
                    className: 'customize-btn',
                    id: 'customizeBtn',
                    onClick: handleCustomizeClick
                }, 'Customize')
            ]),
            React.createElement(AccountTabs, {
                key: 'tabs',
                accounts: balances,
                selectedAccountId: selectedAccountId,
                onAccountSelect: setSelectedAccountId
            })
        ]),
        React.createElement(AccountModal, {
            key: 'modal',
            isOpen: isModalOpen,
            accounts: allAccounts,
            selectedAccountIds: modalSelectedIds,
            onClose: handleModalClose,
            onSave: handleModalSave,
            onToggleAccount: handleModalToggleAccount
        }),
        React.createElement(TransactionForm, {
            key: 'form',
            categories: categories,
            accounts: accounts,
            onSubmit: handleTransactionSubmit,
            isLoading: isLoading
        }),
        React.createElement(StatusMessage, {
            key: 'status',
            message: statusMessage,
            type: statusType
        }),
        React.createElement(RecentActivity, {
            key: 'recent',
            transactions: recentTransactions,
            isExpanded: isRecentActivityExpanded,
            onToggle: () => setIsRecentActivityExpanded(!isRecentActivityExpanded)
        })
    ]);
}

module.exports = App;
