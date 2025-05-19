// backend/routes/deposits-table.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // or your MySQL user
  password: '', // or your MySQL password
  database: 'pncaccounts',
};

const ACCOUNTS = [
  { key: 'spending', label: 'Spending' },
  { key: 'reserve', label: 'Reserve' },
  { key: 'growth', label: 'Growth' },
];

// GET /api/deposits-table
router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    const connection = await mysql.createConnection(dbConfig);
    const grouped = { spending: [], reserve: [], growth: [] };
    for (const { key } of ACCOUNTS) {
      let sql = 'SELECT * FROM Deposits WHERE Account = ?';
      let params = [key];
      if (q) {
        sql += ' AND (Bill LIKE ?)';
        params.push(`%${q}%`);
      }
      sql += ' ORDER BY DateAdded DESC';
      const [rows] = await connection.execute(sql, params);
      grouped[key] = rows;
    }
    await connection.end();
    res.json(grouped);
  } catch (err) {
    console.error('Error in /api/deposits-table:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
