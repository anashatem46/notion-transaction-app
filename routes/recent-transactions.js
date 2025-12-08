const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { validateQueryParams, validateNumberRange } = require('../middleware/validation');
const { CONFIG } = require('../constants/config');

// GET /recent-transactions - Get recent transactions
router.get(
    '/',
    validateQueryParams({
        limit: validateNumberRange(1, CONFIG.API.MAX_RECENT_TRANSACTIONS_LIMIT)
    }),
    async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || CONFIG.API.DEFAULT_RECENT_TRANSACTIONS_LIMIT;
            const transactions = await transactionService.getRecentTransactions(limit);
            res.json(transactions);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
