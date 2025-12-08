const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const logger = require('../middleware/logger');

// POST /transaction - Create new transaction in Notion
router.post(
    '/',
    async (req, res, next) => {
        try {
            // Validate required fields - category is only required for expenses
            const requiredFields = ['name', 'amount', 'type', 'date', 'account'];
            let missingFields = [];
            
            requiredFields.forEach(field => {
                const value = req.body[field];
                let isValid = true;
                
                if (value === undefined || value === null) {
                    isValid = false;
                } else if (field === 'amount') {
                    // For amount, check if it's a valid number
                    const numValue = typeof value === 'number' ? value : parseFloat(value);
                    if (isNaN(numValue) || numValue <= 0) {
                        isValid = false;
                    }
                } else {
                    // For string fields, check if it's not empty after trimming
                    const stringValue = String(value);
                    if (stringValue.trim() === '') {
                        isValid = false;
                    }
                }
                
                if (!isValid) {
                    missingFields.push(field);
                    logger.warn(`Missing field: ${field}, value:`, value, 'type:', typeof value);
                } else {
                    logger.info(`Field ${field} is valid:`, value);
                }
            });

            // Category is required only for expenses, NOT for income
            const typeString = req.body.type ? String(req.body.type).trim() : '';
            const transactionType = typeString.toLowerCase();
            const isIncome = transactionType === 'income' || transactionType.includes('income');
            const isExpense = (transactionType === 'expense' || transactionType.includes('expense')) && !isIncome;
            
            // ONLY require category for expenses (not for income)
            if (isIncome) {
                // Income transactions - category is always optional
            } else if (isExpense) {
                // Expense transactions - category is required
                const category = req.body.category;
                if (!category || (typeof category === 'string' && category.trim() === '')) {
                    missingFields.push('category');
                }
            }
            // For unknown transaction types, category is optional

            // Final safeguard: if it's income, remove category from missingFields if it's there
            if (isIncome && missingFields.includes('category')) {
                missingFields = missingFields.filter(field => field !== 'category');
            }
            
            if (missingFields.length > 0) {
                logger.warn('Validation failed. Missing fields:', missingFields);
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: `The following fields are required: ${missingFields.join(', ')}`,
                    received: {
                        name: req.body.name ? 'provided' : 'missing',
                        amount: req.body.amount ? 'provided' : 'missing',
                        type: req.body.type ? 'provided' : 'missing',
                        date: req.body.date ? 'provided' : 'missing',
                        account: req.body.account ? 'provided' : 'missing',
                        category: req.body.category ? 'provided' : 'missing'
                    }
                });
            }

            const result = await transactionService.createTransaction(req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
