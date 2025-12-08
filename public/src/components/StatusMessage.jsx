const React = require('react');

function StatusMessage({ message, type, onClose }) {
    if (!message) return null;

    return React.createElement('div', {
        className: `status ${type} show`,
        style: {
            marginTop: '20px',
            padding: '16px',
            borderRadius: '8px',
            fontWeight: '600',
            textAlign: 'center',
            backgroundColor: type === 'success' ? '#d1fae5' : '#fee2e2',
            color: type === 'success' ? '#065f46' : '#991b1b',
            border: `2px solid ${type === 'success' ? '#10b981' : '#ef4444'}`
        }
    }, message);
}

module.exports = StatusMessage;
