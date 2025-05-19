const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Corrected password
  database: 'pncaccounts'
};

router.get('/reserve-chart', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end date' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

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

    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Error in /reserve-chart:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
