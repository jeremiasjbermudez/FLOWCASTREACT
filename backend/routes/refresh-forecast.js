// backend/routes/refresh-forecast.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // Set your MySQL user
  password: '', // Set your MySQL password
  database: 'pncaccounts',
};

// POST /api/refresh-forecast
router.post('/', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // 1. Truncate the Forecast table
    await connection.execute('TRUNCATE TABLE Forecast');
    // 2. Insert from Bills, Expenses, Deposits, Spending, Reserve, Growth
    const sql = `
      INSERT INTO Forecast (Date, Description, Withdrawals, Deposits, Balance, Account)
      SELECT DayOfMonth, Bill, Amount, NULL, -Amount, Account FROM Bills
      UNION ALL
      SELECT DateAdded, Bill, Amount, NULL, -Amount, Account FROM Expenses
      UNION ALL
      SELECT DateAdded, Bill, NULL, Amount, Amount, Account FROM Deposits
      UNION ALL
      SELECT Date, Description, Withdrawals, Deposits, Balance, 'spending' FROM Spending
      UNION ALL
      SELECT Date, Description, Withdrawals, Deposits, Balance, 'reserve' FROM Reserve
      UNION ALL
      SELECT Date, Description, Withdrawals, Deposits, Balance, 'growth' FROM Growth
    `;
    await connection.query(sql);
    await connection.end();
    res.json({ message: 'Forecast table refreshed successfully.' });
  } catch (err) {
    if (connection) await connection.end();
    console.error('Error refreshing forecast:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
