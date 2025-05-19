const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const mysql = require('mysql2/promise');

const upload = multer({ dest: 'uploads/' });

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Set your MySQL password if needed
  database: 'PNCaccounts', // FIXED: match case with main app
};

function cleanMoney(value) {
  if (!value) return null;
  return parseFloat(String(value).replace(/[$, ]/g, '')) || null;
}

function cleanDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().slice(0, 10);
}

async function rowExists(connection, table, date, description, amountColumn, amountValue) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count FROM \`${table}\` WHERE Date = ? AND Description = ? AND \`${amountColumn}\` = ?`,
    [date, description, amountValue]
  );
  return rows[0].count > 0;
}

async function importCSV(connection, filePath, tableName) {
  const parser = fs.createReadStream(filePath).pipe(csv.parse({ from_line: 2 }));
  let newRows = 0;
  for await (const row of parser) {
    if (tableName === 'Spending') {
      const [date, description, withdrawals, deposits, category, balance] = row;
      const cleanWithdrawals = cleanMoney(withdrawals);
      const cleanDeposits = cleanMoney(deposits);
      const cleanBalance = cleanMoney(balance);
      const mainAmt = cleanDeposits !== null ? cleanDeposits : cleanWithdrawals;
      const amountColumn = cleanDeposits !== null ? 'Deposits' : 'Withdrawals';
      if (!(await rowExists(connection, tableName, cleanDate(date), description, amountColumn, mainAmt))) {
        await connection.execute(
          `INSERT INTO Spending (Date, Description, Withdrawals, Deposits, Category, Balance) VALUES (?, ?, ?, ?, ?, ?)`,
          [cleanDate(date), description, cleanWithdrawals, cleanDeposits, category, cleanBalance]
        );
        newRows++;
        console.log(`[Spending] Inserted:`, {date, description, withdrawals, deposits, category, balance});
      } else {
        console.log(`[Spending] Skipped duplicate:`, {date, description, withdrawals, deposits, category, balance});
      }
    } else {
      // Reserve & Growth
      const [date, description, withdrawals, deposits, balance] = row;
      const cleanWithdrawals = cleanMoney(withdrawals);
      const cleanDeposits = cleanMoney(deposits);
      const cleanBalance = cleanMoney(balance);
      const mainAmt = cleanDeposits !== null ? cleanDeposits : cleanWithdrawals;
      const amountColumn = cleanDeposits !== null ? 'Deposits' : 'Withdrawals';
      if (!(await rowExists(connection, tableName, cleanDate(date), description, amountColumn, mainAmt))) {
        await connection.execute(
          `INSERT INTO \`${tableName}\` (Date, Description, Withdrawals, Deposits, Balance) VALUES (?, ?, ?, ?, ?)`,
          [cleanDate(date), description, cleanWithdrawals, cleanDeposits, cleanBalance]
        );
        newRows++;
        console.log(`[${tableName}] Inserted:`, {date, description, withdrawals, deposits, balance});
      } else {
        console.log(`[${tableName}] Skipped duplicate:`, {date, description, withdrawals, deposits, balance});
      }
    }
  }
  return newRows;
}

router.post('/', upload.fields([
  { name: 'spending', maxCount: 1 },
  { name: 'reserve', maxCount: 1 },
  { name: 'growth', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received POST /api/update-tables');
    console.log('Files:', req.files);
    const connection = await mysql.createConnection(dbConfig);
    let messages = [];
    if (req.files.spending) {
      console.log('Processing spending file:', req.files.spending[0].path);
      const count = await importCSV(connection, req.files.spending[0].path, 'Spending');
      messages.push(`Imported ${count} new rows into Spending`);
    }
    if (req.files.reserve) {
      console.log('Processing reserve file:', req.files.reserve[0].path);
      const count = await importCSV(connection, req.files.reserve[0].path, 'Reserve');
      messages.push(`Imported ${count} new rows into Reserve`);
    }
    if (req.files.growth) {
      console.log('Processing growth file:', req.files.growth[0].path);
      const count = await importCSV(connection, req.files.growth[0].path, 'Growth');
      messages.push(`Imported ${count} new rows into Growth`);
    }
    await connection.end();
    res.json({ message: messages.join('. ') });
  } catch (err) {
    console.error('Error in /api/update-tables:', err); // Log the error for debugging
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
