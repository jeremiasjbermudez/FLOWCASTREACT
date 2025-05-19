const express = require('express');
const router = express.Router();
const db = require('../db');

// Calculate payoff time (months) and total interest
function calculatePayoffTime(balance, monthlyPayment, annualInterest) {
  if (monthlyPayment <= 0 || balance <= 0) return 0;
  const monthlyInterest = annualInterest / 100 / 12;
  if (monthlyInterest === 0) {
    return Math.ceil(balance / monthlyPayment);
  }
  const denominator = monthlyPayment - balance * monthlyInterest;
  if (denominator <= 0) return 0;
  const n = Math.log(monthlyPayment / denominator) / Math.log(1 + monthlyInterest);
  return Math.max(0, Math.ceil(n));
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Goals');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
  const { Name, Description, Category, CurrentBalance, InterestRate, EstMonthlyPmt } = req.body;
  const balance = parseFloat(CurrentBalance) || 0;
  const interest = parseFloat(InterestRate) || 0;
  const monthly = parseFloat(EstMonthlyPmt) || 0;

  const payOffTime = calculatePayoffTime(balance, monthly, interest);
  const payOffTimeYrs = Math.round((payOffTime / 12) * 100) / 100;

  try {
    const [result] = await db.query(
      `INSERT INTO Goals (Name, Description, Category, CurrentBalance, InterestRate, EstMonthlyPmt, PayOffTime, PayOffTimeYrs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Name, Description, Category, balance, interest, monthly, payOffTime, payOffTimeYrs]
    );
    res.status(201).json({ message: 'Goal added successfully.', id: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', async (req, res) => {
  const { Name, Description, Category, CurrentBalance, InterestRate, EstMonthlyPmt } = req.body;
  const id = req.params.id;
  const balance = parseFloat(CurrentBalance) || 0;
  const interest = parseFloat(InterestRate) || 0;
  const monthly = parseFloat(EstMonthlyPmt) || 0;

  const payOffTime = calculatePayoffTime(balance, monthly, interest);
  const payOffTimeYrs = Math.round((payOffTime / 12) * 100) / 100;

  try {
    await db.query(
      `UPDATE Goals SET Name=?, Description=?, Category=?, CurrentBalance=?, InterestRate=?, EstMonthlyPmt=?, PayOffTime=?, PayOffTimeYrs=? WHERE ID=?`,
      [Name, Description, Category, balance, interest, monthly, payOffTime, payOffTimeYrs, id]
    );
    res.json({ message: 'Goal updated successfully.' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM Goals WHERE ID = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
