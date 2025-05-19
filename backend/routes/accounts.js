const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Update these credentials as needed
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your password if you set one
  database: 'pncaccounts',
};

router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, name, balance, type FROM accounts');
    await connection.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
