// backend/routes/forecast-table.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // updated to use root user
  password: '', // updated to use blank password
  database: 'PNCaccounts', // match legacy PHP database name (case sensitive on some systems)
};

const ACCOUNTS = [
  { key: 'spending', label: 'Spending' },
  { key: 'reserve', label: 'Reserve' },
  { key: 'growth', label: 'Growth' },
];

const verifyCounts = async (connection) => {
  const tables = [
    { name: 'Bills', sql: 'SELECT COUNT(*) as count FROM Bills' },
    { name: 'Expenses', sql: 'SELECT COUNT(*) as count FROM Expenses' },
    { name: 'Deposits', sql: 'SELECT COUNT(*) as count FROM Deposits' },
    { name: 'Spending', sql: 'SELECT COUNT(*) as count FROM Spending' },
    { name: 'Reserve', sql: 'SELECT COUNT(*) as count FROM Reserve' },
    { name: 'Growth', sql: 'SELECT COUNT(*) as count FROM Growth' },
    { name: 'Forecast', sql: 'SELECT COUNT(*) as count FROM Forecast' },
  ];
  const results = {};
  for (const { name, sql } of tables) {
    try {
      const [rows] = await connection.promise().query(sql);
      results[name] = rows[0].count;
    } catch (err) {
      results[name] = 'ERR';
    }
  }
  console.log('Forecast source table row counts:', results);
  return results;
};

router.post('/refresh', async (req, res) => {
  // For manual refresh if needed
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('TRUNCATE TABLE Forecast');
    const sql = `
      INSERT INTO Forecast (Date, Description, Withdrawals, Deposits, Balance, Account)
      SELECT DATE(g.Date) AS Date, g.Description AS Description, g.Withdrawals AS Withdrawals, g.Deposits AS Deposits, g.Balance AS Balance, 'growth' AS Account FROM growth g
      UNION ALL
      SELECT DATE(r.Date) AS Date, r.Description AS Description, r.Withdrawals AS Withdrawals, r.Deposits AS Deposits, r.Balance AS Balance, 'reserve' AS Account FROM reserve r
      UNION ALL
      SELECT DATE(s.Date) AS Date, s.Description AS Description, s.Withdrawals AS Withdrawals, s.Deposits AS Deposits, s.Balance AS Balance, 'spending' AS Account FROM spending s
      UNION ALL
      SELECT DATE(e.DateAdded) AS Date, e.Bill AS Description, e.Amount AS Withdrawals, NULL AS Deposits, -e.Amount AS Balance, e.Account AS Account FROM expenses e
      UNION ALL
      SELECT DATE(d.DateAdded) AS Date, d.Bill AS Description, NULL AS Withdrawals, d.Amount AS Deposits, d.Amount AS Balance, d.Account AS Account FROM deposits d
      UNION ALL
      SELECT DATE(b.DayOfMonth) AS Date, b.Bill AS Description, b.Amount AS Withdrawals, NULL AS Deposits, -b.Amount AS Balance, b.Account AS Account FROM bills b
    `;
    await connection.query(sql);
    await verifyCounts(connection);
    await connection.end();
    res.json({ message: 'Forecast table refreshed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { q, start, end } = req.query;
  try {
    // 1. Refresh the Forecast table before every request
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('TRUNCATE TABLE Forecast');
    const sql = `
      INSERT INTO Forecast (Date, Description, Withdrawals, Deposits, Balance, Account)
      SELECT DATE(b.DayOfMonth) AS Date, b.Bill AS Description, b.Amount AS Withdrawals, NULL AS Deposits, -b.Amount AS Balance, b.Account AS Account FROM bills b
      UNION ALL
      SELECT DATE(e.DateAdded) AS Date, e.Bill AS Description, e.Amount AS Withdrawals, NULL AS Deposits, -e.Amount AS Balance, e.Account AS Account FROM expenses e
      UNION ALL
      SELECT DATE(d.DateAdded) AS Date, d.Bill AS Description, NULL AS Withdrawals, d.Amount AS Deposits, d.Amount AS Balance, d.Account AS Account FROM deposits d
      UNION ALL
      SELECT DATE(s.Date) AS Date, s.Description AS Description, s.Withdrawals AS Withdrawals, s.Deposits AS Deposits, s.Balance AS Balance, 'spending' AS Account FROM spending s
      UNION ALL
      SELECT DATE(r.Date) AS Date, r.Description AS Description, r.Withdrawals AS Withdrawals, r.Deposits AS Deposits, r.Balance AS Balance, 'reserve' AS Account FROM reserve r
      UNION ALL
      SELECT DATE(g.Date) AS Date, g.Description AS Description, g.Withdrawals AS Withdrawals, g.Deposits AS Deposits, g.Balance AS Balance, 'growth' AS Account FROM growth g
    `;
    await connection.query(sql);
    await verifyCounts(connection);
    let totalNetAll = 0;
    const nets = {};
    const tables = {};
    for (const { key } of ACCOUNTS) {
      let where = ["Account = ?"];
      let params = [key];
      if (start) { where.push('Date >= ?'); params.push(start); }
      if (end)   { where.push('Date <= ?'); params.push(end); }
      if (q)     { where.push('(Date LIKE ? OR Description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
      // --- FIX: Use row with highest balance on start date as start balance ---
      let startBalance = 0;
      let excludeId = null;
      if (start) {
        // Find row with highest balance on the start date for this account
        const [balRows] = await connection.execute(
          `SELECT ID, Balance FROM Forecast WHERE Account = ? AND Date = ? ORDER BY Balance DESC LIMIT 1`,
          [key, start]
        );
        if (balRows.length > 0) {
          startBalance = parseFloat(balRows[0].Balance) || 0;
          excludeId = balRows[0].ID;
        }
      }
      // If not found, fallback to first row in range (legacy fallback)
      if (!startBalance) {
        const [firstRows] = await connection.execute(
          `SELECT ID, Balance, Date FROM Forecast ${whereSql} ORDER BY Date ASC, ID ASC LIMIT 1`,
          params
        );
        if (firstRows.length > 0) {
          startBalance = parseFloat(firstRows[0].Balance) || 0;
          excludeId = firstRows[0].ID;
        }
      }
      // Sum deposits/withdrawals for all rows after the start row (exclude that row)
      let sumWhere = ["Account = ?"];
      let sumParams = [key];
      if (start) { sumWhere.push('Date >= ?'); sumParams.push(start); }
      if (end)   { sumWhere.push('Date <= ?'); sumParams.push(end); }
      if (q)     { sumWhere.push('(Date LIKE ? OR Description LIKE ?)'); sumParams.push(`%${q}%`, `%${q}%`); }
      if (excludeId !== null) {
        sumWhere.push('NOT (ID = ?)');
        sumParams.push(excludeId);
      }
      const sumWhereSql = sumWhere.length ? 'WHERE ' + sumWhere.join(' AND ') : '';
      const [totalsRows] = await connection.execute(
        `SELECT COALESCE(SUM(Deposits),0) AS deposits, COALESCE(SUM(Withdrawals),0) AS withdrawals FROM Forecast ${sumWhereSql}`,
        sumParams
      );
      const deposits = parseFloat(totalsRows[0].deposits) || 0;
      const withdrawals = parseFloat(totalsRows[0].withdrawals) || 0;
      const net = startBalance + deposits - withdrawals;
      nets[key] = { start_balance: startBalance, deposits, withdrawals, net };
      totalNetAll += net;
      // Table rows (include all rows)
      const [rows] = await connection.execute(
        `SELECT Date, Description, Withdrawals, Deposits, Balance FROM Forecast ${whereSql} ORDER BY Date DESC`,
        params
      );
      tables[key] = rows;
    }
    await connection.end();
    res.json({ nets, totalNetAll, tables });
  } catch (err) {
    console.error('Error in /api/forecast-table:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forecast-defaults - returns { defaultStart, defaultEnd }
router.get('/defaults', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Find closest "5737 PAYROLL" date before today
    let defaultStart = '';
    const [rows] = await connection.execute(
      "SELECT Date FROM reserve WHERE Description LIKE '%5737 PAYROLL%' AND Date <= CURDATE() ORDER BY Date DESC LIMIT 1"
    );
    if (rows.length > 0) defaultStart = rows[0].Date;
    // Default end date logic
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    let defaultEnd = '';
    if (day >= 16) {
      // Last day of month (assume 30th for legacy compatibility)
      defaultEnd = `${year}-${month}-30`;
    } else {
      defaultEnd = `${year}-${month}-15`;
    }
    await connection.end();
    res.json({ defaultStart, defaultEnd });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
