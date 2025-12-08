const React = require('react');

function StatusMessage({ message, type, onClose }) {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';

    return React.createElement('div', {
        className: `mt-5 p-4 rounded-lg font-semibold text-center border-2 ${bgColor} ${textColor} ${borderColor} animate-slide-in`
    }, message);
}

module.exports = StatusMessage;
