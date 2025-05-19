const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // update as needed
  password: '', // update as needed
  database: 'pncaccounts',
};

// GET /api/calendar?year=YYYY&month=MM
router.get('/', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ error: 'Missing year or month' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Scheduled Bills
    const start = `${year}-${month}-01`;
    const end = new Date(year, parseInt(month), 0).toISOString().slice(0, 10);
    const [bills] = await connection.execute(
      'SELECT Bill, Amount, DayOfMonth FROM Bills WHERE DayOfMonth BETWEEN ? AND ?',
      [start, end]
    );
    // Paid Bills
    const [billsPaid] = await connection.execute(
      'SELECT Description, Amount, Date FROM billspaid WHERE Date BETWEEN ? AND ?',
      [start, end]
    );
    await connection.end();
    res.json({ bills, billsPaid });
  } catch (err) {
    console.error('Error in /api/calendar:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
