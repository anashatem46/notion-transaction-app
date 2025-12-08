const express = require('express');
const router = express.Router();
const accountService = require('../services/accountService');

// GET /accounts - Fetch accounts from Notion
router.get('/', async (req, res, next) => {
    try {
        const accounts = await accountService.getAllAccounts();
        res.json(accounts);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
