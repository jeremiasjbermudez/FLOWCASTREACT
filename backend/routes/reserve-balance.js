// filepath: backend/routes/reserve-balance.js
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'pncaccounts' // Updated to use the correct database
};

// Dummy data generator for demonstration
function generateReserveData(start, end) {
  const data = [];
  let current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    const dateStr = current.toISOString().slice(0, 10);
    // Simulate multiple entries for the day
    const entries = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => {
      return {
        balance: 1000 - Math.floor(Math.random() * 500),
        deposits: Math.floor(Math.random() * 200),
        withdrawals: Math.floor(Math.random() * 100)
      };
    });
    // Find the entry with the lowest balance
    const lowest = entries.reduce((min, e) => e.balance < min.balance ? e : min, entries[0]);
    // Sum deposits and withdrawals for the day
    const totalDeposits = entries.reduce((sum, e) => sum + e.deposits, 0);
    const totalWithdrawals = entries.reduce((sum, e) => sum + e.withdrawals, 0);
    data.push({
      date: dateStr,
      balance: Number(lowest.balance.toFixed(2)),
      deposits: Number(totalDeposits.toFixed(2)),
      withdrawals: Number(totalWithdrawals.toFixed(2))
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

router.get('/', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end date' });
  }
  // Replace with real DB logic as needed
  const data = generateReserveData(start, end);
  res.json(data);
});

router.get('/reserve-balance', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end date' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Simplified query to retrieve the lowest balance, total withdrawals, and total deposits for each day
    const [rows] = await connection.execute(
      `SELECT 
        DATE(Date) as date,
        MIN(Balance) as balance,
        SUM(COALESCE(Withdrawals, 0)) as withdrawals,
        SUM(COALESCE(Deposits, 0)) as deposits
      FROM reserve
      WHERE Date >= ? AND Date <= ?
      GROUP BY DATE(Date)
      ORDER BY DATE(Date)`,
      [start, end]
    );

    console.log("Raw SQL Query Result:", rows); // Log the raw query result before sending it to the frontend
    console.log("SQL Query Result:", rows); // Debugging log to inspect query result

    // Debugging log for specific date
    const specificDate = '2025-05-16';
    const [specificRows] = await connection.execute(
      `SELECT 
        DATE(Date) as date,
        MIN(Balance) as balance,
        SUM(COALESCE(Withdrawals, 0)) as withdrawals,
        SUM(COALESCE(Deposits, 0)) as deposits
      FROM reserve
      WHERE DATE(Date) = ?
      GROUP BY DATE(Date)`,
      [specificDate]
    );
    console.log("Query Result for Specific Date (2025-05-16):", specificRows);

    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Error in /api/reserve-balance:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
