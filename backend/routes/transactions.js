const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // or your MySQL user
  password: '', // or your MySQL password
  database: 'pncaccounts',
};

// Helper function to fetch transactions by type
async function fetchTransactionsByType(type, goalName) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const query = `SELECT * FROM ${type} WHERE GoalName = ?`;
    const [transactions] = await connection.execute(query, [goalName]);
    return transactions;
  } catch (error) {
    console.error(`Error fetching ${type} transactions for goal ${goalName}:`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Add a generic route to handle all transaction types
router.get('/', async (req, res) => {
  const { goalName, type } = req.query;
  if (!goalName || !type) {
    return res.status(400).json({ error: 'goalName and type are required' });
  }

  try {
    const transactions = await fetchTransactionsByType(type, goalName);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch ${type} transactions` });
  }
});

// GET /api/transactions/spending
router.get('/spending', async (req, res) => {
  const { goalName } = req.query;
  if (!goalName) {
    return res.status(400).json({ error: 'goalName is required' });
  }

  try {
    const transactions = await fetchTransactionsByType('spending', goalName);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending transactions' });
  }
});

// GET /api/transactions/reserve
router.get('/reserve', async (req, res) => {
  const { goalName } = req.query;
  if (!goalName) {
    return res.status(400).json({ error: 'goalName is required' });
  }

  try {
    const transactions = await fetchTransactionsByType('reserve', goalName);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reserve transactions' });
  }
});

// GET /api/transactions/growth
router.get('/growth', async (req, res) => {
  const { goalName } = req.query;
  if (!goalName) {
    return res.status(400).json({ error: 'goalName is required' });
  }

  try {
    const transactions = await fetchTransactionsByType('growth', goalName);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch growth transactions' });
  }
});

module.exports = router;
