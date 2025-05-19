// backend/routes/bills-table.js
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

// GET /api/bills-table?start=YYYY-MM-DD&end=YYYY-MM-DD&q=search
router.get('/', async (req, res) => {
  const { start, end, q } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    let where = [];
    let params = [];
    if (start) { where.push('DayOfMonth >= ?'); params.push(start); }
    if (end)   { where.push('DayOfMonth <= ?'); params.push(end); }
    if (q)     { where.push('(Bill LIKE ? OR ContainsText LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [rows] = await connection.execute(
      `SELECT * FROM Bills ${whereSql} ORDER BY DayOfMonth DESC`,
      params
    );
    // Group by account
    const grouped = { spending: [], reserve: [], growth: [] };
    for (const row of rows) {
      if (grouped[row.Account]) grouped[row.Account].push(row);
    }
    // For each bill, check if it's matched in BillsPaid
    for (const key of Object.keys(grouped)) {
      // Remove matched bills instead of highlighting
      grouped[key] = grouped[key].filter(row => {
        let matched = false;
        if (row.ContainsText) {
          // Check if this bill is matched in BillsPaid
          return (async () => {
            const [matchRows] = await connection.execute(
              `SELECT 1 FROM BillsPaid WHERE Description LIKE ? AND Amount = ? AND Account = ? LIMIT 1`,
              [`%${row.ContainsText}%`, row.Amount, row.Account]
            );
            matched = matchRows.length > 0;
            return !matched; // Only keep if not matched
          })();
        }
        return true; // Keep if no ContainsText
      });
    }
    await connection.end();
    res.json(grouped);
  } catch (err) {
    console.error('Error in /api/bills-table:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bills-table/matched - delete all matched (highlighted) bills
router.delete('/matched', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Find all matched bills
    const [matchedRows] = await connection.execute(`
      SELECT b.id FROM Bills b
      JOIN BillsPaid p ON b.ContainsText IS NOT NULL AND b.ContainsText != ''
        AND p.Description LIKE CONCAT('%', b.ContainsText, '%')
        AND p.Amount = b.Amount
        AND p.Account = b.Account
    `);
    if (matchedRows.length > 0) {
      const ids = matchedRows.map(r => r.id);
      // Delete all matched bills
      await connection.execute(
        `DELETE FROM Bills WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      );
    }
    await connection.end();
    res.json({ deleted: matchedRows.length });
  } catch (err) {
    console.error('Error in DELETE /api/bills-table/matched:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
