// backend/routes/accounts-data.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // or your MySQL user
  password: '', // or your MySQL password
  database: 'pncaccounts',
};

const TABLES = [
  { name: 'Spending', hasCategory: true },
  { name: 'Reserve', hasCategory: false },
  { name: 'Growth', hasCategory: false },
];

router.get('/', async (req, res) => {
  const search = req.query.search || '';
  try {
    const connection = await mysql.createConnection(dbConfig);
    const result = {};
    for (const { name: table, hasCategory } of TABLES) {
      // Check if Category column exists (for flexibility)
      let categoryExists = hasCategory;
      if (!hasCategory) {
        const [columns] = await connection.execute(`SHOW COLUMNS FROM \`${table}\``);
        categoryExists = columns.some(col => col.Field === 'Category');
      }
      // Build WHERE clause
      let where = '';
      let params = [];
      const dateFilter = req.query.start && req.query.end ? 'Date >= ? AND Date <= ?' : '';
      if (search) {
        where = 'WHERE Description LIKE ?';
        params.push(`%${search}%`);
        if (categoryExists) {
          where = 'WHERE (Description LIKE ? OR Category LIKE ?)';
          params = [`%${search}%`, `%${search}%`];
        }
        if (dateFilter) {
          where += ' AND ' + dateFilter;
          params.push(req.query.start, req.query.end);
        }
      } else if (dateFilter) {
        where = 'WHERE ' + dateFilter;
        params = [req.query.start, req.query.end];
      }
      // Query all rows
      const [rows] = await connection.execute(
        `SELECT * FROM \`${table}\` ${where} ORDER BY Date DESC`,
        params
      );
      // Query totals
      const [totalsRows] = await connection.execute(
        `SELECT SUM(Withdrawals) AS TotalWithdrawals, SUM(Deposits) AS TotalDeposits, SUM(Balance) AS TotalBalance FROM \`${table}\` ${where}`,
        params
      );
      const totals = totalsRows[0] || { TotalWithdrawals: 0, TotalDeposits: 0, TotalBalance: 0 };
      result[table] = {
        rows,
        totals,
        hasCategory: categoryExists,
      };
    }
    await connection.end();
    res.json(result);
  } catch (err) {
    console.error('Error in /api/accounts-data:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
