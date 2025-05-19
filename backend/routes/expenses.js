const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'PNCaccounts',
};

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM Expenses');
    await connection.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add expense
router.post('/', async (req, res) => {
  try {
    const { Bill, Amount, Account, DateAdded } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO Expenses (Bill, Amount, Account, DateAdded) VALUES (?, ?, ?, ?)',
      [Bill, Amount, Account, Array.isArray(DateAdded) ? DateAdded[0] : DateAdded]
    );
    await connection.end();
    res.status(201).json({ id: result.insertId, Bill, Amount, Account, DateAdded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { Bill, Amount, Account, DateAdded } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE Expenses SET Bill=?, Amount=?, Account=?, DateAdded=? WHERE ID=?',
      [Bill, Amount, Account, Array.isArray(DateAdded) ? DateAdded[0] : DateAdded, req.params.id]
    );
    await connection.end();
    res.json({ id: req.params.id, Bill, Amount, Account, DateAdded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM Expenses WHERE ID=?', [req.params.id]);
    await connection.end();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
