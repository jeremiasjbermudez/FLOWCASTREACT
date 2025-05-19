const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // update as needed
  password: '', // update as needed
  database: 'pncaccounts',
};

// GET /api/bills-paid?start=YYYY-MM-DD&end=YYYY-MM-DD&q=search
router.get('/', async (req, res) => {
  let { start, end, q } = req.query;
  try {
    // Default start/end to first/last day of current month if not provided
    const now = new Date();
    if (!start) {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    }
    if (!end) {
      // Get last day of month
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    }
    const connection = await mysql.createConnection(dbConfig);
    let where = [];
    let params = [];
    if (start) { where.push('Date >= ?'); params.push(start); }
    if (end) { where.push('Date <= ?'); params.push(end); }
    if (q) {
      where.push('(Description LIKE ? OR Amount LIKE ? OR Date LIKE ? OR Account LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    const accounts = ['spending', 'reserve', 'growth'];
    const results = {};
    for (const account of accounts) {
      let sql = `SELECT id, Description, Amount, Date, Account FROM billspaid WHERE Account = ?`;
      let accParams = [account, ...params];
      if (where.length) sql += ' AND ' + where.join(' AND ');
      sql += ' ORDER BY Date DESC';
      try {
        const [rows] = await connection.execute(sql, accParams);
        results[account] = rows;
      } catch (err) {
        console.error('BillsPaid query error:', { sql, accParams, err });
        throw err;
      }
    }
    // Remove Bills that match any BillsPaid entry (by ContainsText and DayOfMonth)
    for (const accountRows of Object.values(results)) {
      for (const paid of accountRows) {
        // Find Bills with matching ContainsText and DayOfMonth
        const [billsToDelete] = await connection.execute(
          `SELECT id FROM Bills WHERE ? != '' AND ? IS NOT NULL AND DayOfMonth = ? AND INSTR(?, ContainsText) > 0`,
          [paid.Description, paid.Description, paid.Date, paid.Description]
        );
        if (billsToDelete.length > 0) {
          const ids = billsToDelete.map(b => b.id);
          await connection.execute(
            `DELETE FROM Bills WHERE id IN (${ids.map(() => '?').join(',')})`,
            ids
          );
        }
      }
    }
    await connection.end();
    res.json(results);
  } catch (err) {
    console.error('Error in /api/bills-paid:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills-paid/populate - populate BillsPaid from matched Bills
router.post('/populate', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Find all Bills with ContainsText and a matching transaction in Reserve, Spending, or Growth
    const [bills] = await connection.execute(`
      SELECT b.Bill, b.Amount, b.DayOfMonth, b.ContainsText, b.Account
      FROM Bills b
      WHERE b.ContainsText IS NOT NULL AND TRIM(b.ContainsText) != ''
    `);
    let inserted = 0;
    for (const bill of bills) {
      console.log(`Processing bill:`, bill);
      const tables = ['Reserve', 'Spending', 'Growth'];
      for (const table of tables) {
        // Case-insensitive match on ContainsText
        const [matches] = await connection.execute(
          `SELECT Description, Withdrawals AS Amount, Date FROM \`${table}\` WHERE LOWER(Description) LIKE ?`,
          [`%${bill.ContainsText.toLowerCase()}%`]
        );
        console.log(`  Table: ${table}, Matches found:`, matches.length);
        for (const match of matches) {
          match.Account = table.toLowerCase();
          // Insert into BillsPaid if not already present
          const [exists] = await connection.execute(
            `SELECT 1 FROM BillsPaid WHERE Description = ? AND Amount = ? AND Date = ? AND Account = ? LIMIT 1`,
            [match.Description, match.Amount, match.Date, match.Account]
          );
          if (exists.length === 0) {
            await connection.execute(
              `INSERT INTO BillsPaid (Description, Amount, Date, Account) VALUES (?, ?, ?, ?)`,
              [match.Description, match.Amount, match.Date, match.Account]
            );
            inserted++;
            console.log(`    Inserted BillsPaid:`, match);
          } else {
            console.log(`    Skipped (already exists):`, match);
          }
        }
      }
    }
    await connection.end();
    res.json({ inserted });
  } catch (err) {
    console.error('Error in POST /api/bills-paid/populate:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
