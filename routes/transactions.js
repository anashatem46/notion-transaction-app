const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const logger = require('../middleware/logger');

// POST /transaction - Create new transaction in Notion
router.post(
    '/',
    async (req, res, next) => {
        try {
            // Debug logging
            logger.info('Received transaction data:', JSON.stringify(req.body, null, 2));
            
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
            // Be very explicit: if it contains "income", it's income and category is optional
            const typeString = req.body.type ? String(req.body.type).trim() : '';
            const transactionType = typeString.toLowerCase();
            const isIncome = transactionType === 'income' || transactionType.includes('income');
            const isExpense = (transactionType === 'expense' || transactionType.includes('expense')) && !isIncome;
            
            logger.info('Route validation - Transaction type check:', {
                originalType: req.body.type,
                normalizedType: transactionType,
                isIncome: isIncome,
                isExpense: isExpense,
                categoryProvided: !!req.body.category,
                categoryValue: req.body.category
            });
            
            // ONLY require category for expenses (not for income)
            // If it's income, NEVER require category - skip validation entirely
            if (isIncome) {
                // Income transactions - category is always optional
                logger.info('Route: Income transaction detected - category is optional, skipping validation');
            } else if (isExpense) {
                // Expense transactions - category is required
                const category = req.body.category;
                if (!category || (typeof category === 'string' && category.trim() === '')) {
                    missingFields.push('category');
                    logger.warn('Route: Missing category for expense transaction');
                } else {
                    logger.info('Route: Category provided for expense transaction:', category);
                }
            } else {
                // Unknown transaction type - category is optional
                logger.info('Route: Unknown transaction type - category is optional, skipping validation');
            }

            // Final safeguard: if it's income, remove category from missingFields if it's there
            if (isIncome && missingFields.includes('category')) {
                logger.warn('Route: Removing category from missingFields for income transaction');
                missingFields = missingFields.filter(field => field !== 'category');
            }
            
            if (missingFields.length > 0) {
                logger.error('Validation failed. Missing fields:', missingFields);
                logger.error('Received values:', {
                    name: req.body.name,
                    amount: req.body.amount,
                    type: req.body.type,
                    date: req.body.date,
                    account: req.body.account,
                    category: req.body.category
                });
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
