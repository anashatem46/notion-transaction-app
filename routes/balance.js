const express = require('express');
const router = express.Router();
const balanceService = require('../services/balanceService');

// GET /balance - Get balances for all accounts from "Current Status" property
router.get('/', async (req, res, next) => {
    try {
        const result = await balanceService.getAccountBalances();
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
