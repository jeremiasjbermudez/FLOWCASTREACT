const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // update as needed
  password: '', // update as needed
  database: 'pncaccounts',
};

// Get all habits, with optional date/category filters
router.get('/', async (req, res) => {
  const { start, end, category } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    let where = [];
    let params = [];
    if (start) { where.push('Date >= ?'); params.push(start); }
    if (end) { where.push('Date <= ?'); params.push(end); }
    if (category) { where.push('Category = ?'); params.push(category); }
    let sql = 'SELECT * FROM habits';
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY Date DESC';
    const [rows] = await connection.execute(sql, params);
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Error in GET /api/habits:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all unique categories
router.get('/categories', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT DISTINCT Category FROM habits');
    await connection.end();
    res.json(rows.map(r => r.Category));
  } catch (err) {
    console.error('Error in GET /api/habits/categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new habit (auto-populate from spending/reserve/growth)
router.post('/', async (req, res) => {
  const { name, category } = req.body;
  const tables = ['spending', 'reserve', 'growth'];
  try {
    const connection = await mysql.createConnection(dbConfig);
    let inserted = 0;
    for (const table of tables) {
      const [rows] = await connection.execute(
        `SELECT * FROM ${table} WHERE Description LIKE ?`,
        [`%${name}%`]
      );
      for (const row of rows) {
        await connection.execute(
          'INSERT INTO habits (Date, Description, Withdrawals, Deposits, Balance, Name, Category) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [row.Date, row.Description, row.Withdrawals, row.Deposits, row.Balance, name, category]
        );
        inserted++;
      }
    }

    // Fallback: Insert habit with just name and category if no matches found
    if (inserted === 0) {
      await connection.execute(
        'INSERT INTO habits (Name, Category) VALUES (?, ?)',
        [name, category]
      );
      inserted = 1;
    }

    await connection.end();
    res.status(201).json({ inserted });
  } catch (err) {
    console.error('Error in POST /api/habits:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a habit row
router.put('/:id', async (req, res) => {
  const { Date, Description, Withdrawals, Deposits, Balance, Name, Category } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE habits SET Date=?, Description=?, Withdrawals=?, Deposits=?, Balance=?, Name=?, Category=? WHERE id=?',
      [Date, Description, Withdrawals, Deposits, Balance, Name, Category, req.params.id]
    );
    const [rows] = await connection.execute('SELECT * FROM habits WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in PUT /api/habits/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a habit row
router.delete('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM habits WHERE id = ?', [req.params.id]);
    await connection.end();
    res.status(204).end();
  } catch (err) {
    console.error('Error in DELETE /api/habits/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete all habits in a category
router.delete('/category/:category', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM habits WHERE Category = ?', [req.params.category]);
    await connection.end();
    res.status(204).end();
  } catch (err) {
    console.error('Error in DELETE /api/habits/category/:category:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch top 10 most expensive habits
router.get('/top-expensive', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT Name AS name, SUM(Withdrawals) AS total 
       FROM habits 
       GROUP BY Name 
       ORDER BY total DESC 
       LIMIT 10`
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching top expensive habits:', err);
    res.status(500).json({ error: 'Failed to fetch top expensive habits' });
  }
});

module.exports = router;
