const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');

// POST /transaction - Create new transaction in Notion
router.post('/', async (req, res, next) => {
  try {
    const result = await transactionService.createTransaction(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
