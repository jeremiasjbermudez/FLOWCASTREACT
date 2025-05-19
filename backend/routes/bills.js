// backend/routes/bills.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'PNCaccounts',
};

// GET all bills from MySQL
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM Bills');
    await connection.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a new bill to MySQL (support multi-date add)
router.post('/', async (req, res) => {
  let { Bill, Amount, DayOfMonth, ContainsText, Account } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    let inserted = [];
    if (Array.isArray(DayOfMonth)) {
      for (const date of DayOfMonth) {
        const [result] = await connection.execute(
          'INSERT INTO Bills (Bill, Amount, DayOfMonth, ContainsText, Account) VALUES (?, ?, ?, ?, ?)',
          [Bill, Amount, date, ContainsText, Account]
        );
        const [rows] = await connection.execute('SELECT * FROM Bills WHERE id = ?', [result.insertId]);
        if (rows[0]) inserted.push(rows[0]);
      }
    } else {
      const [result] = await connection.execute(
        'INSERT INTO Bills (Bill, Amount, DayOfMonth, ContainsText, Account) VALUES (?, ?, ?, ?, ?)',
        [Bill, Amount, DayOfMonth, ContainsText, Account]
      );
      const [rows] = await connection.execute('SELECT * FROM Bills WHERE id = ?', [result.insertId]);
      if (rows[0]) inserted.push(rows[0]);
    }
    await connection.end();
    res.status(201).json(inserted.length === 1 ? inserted[0] : inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a bill in MySQL
router.put('/:id', async (req, res) => {
  const { Bill, Amount, DayOfMonth, ContainsText, Account } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE Bills SET Bill=?, Amount=?, DayOfMonth=?, ContainsText=?, Account=? WHERE id=?',
      [Bill, Amount, DayOfMonth, ContainsText, Account, req.params.id]
    );
    const [rows] = await connection.execute('SELECT * FROM Bills WHERE id = ?', [req.params.id]);
    await connection.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a bill from MySQL
router.delete('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM Bills WHERE id=?', [req.params.id]);
    await connection.end();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
