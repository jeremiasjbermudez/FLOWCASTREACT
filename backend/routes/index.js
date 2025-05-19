const express = require('express');
const router = express.Router();

// Register all routes
router.use('/goalswd', require('./goalswd'));
router.use('/goals-table', require('./goals-table'));
router.use('/transactions', require('./transactions'));

module.exports = router;
