const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // or your MySQL user
  password: '', // or your MySQL password
  database: 'pncaccounts',
};

// Mock data for goals
let goals = [
  { id: 1, name: 'Vacation', target: 5000, saved: 1200 },
  { id: 2, name: 'Emergency Fund', target: 10000, saved: 5000 }
];

router.get('/', (req, res) => {
  res.json(goals);
});

// Add Goal (POST /api/goals)
router.post('/', async (req, res) => {
  const { Name, name, Description, description, Category, category, CurrentBalance, InterestRate, EstMonthlyPmt } = req.body;
  const goalName = Name || name || '';
  const goalDescription = Description || description || '';
  const goalCategory = Category || category || '';
  const balance = parseFloat(CurrentBalance) || 0;
  const interest = parseFloat(InterestRate) || 0;
  const monthly = parseFloat(EstMonthlyPmt) || 0;

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
  function calculateTotalInterest(balance, monthlyPayment, annualInterest) {
    if (monthlyPayment <= 0 || balance <= 0) return 0;
    const monthlyInterest = annualInterest / 100 / 12;
    let totalInterest = 0;
    let currentBalance = balance;
    let months = 0;
    while (currentBalance > 0 && months < 1000) {
      let interest = currentBalance * monthlyInterest;
      let principal = monthlyPayment - interest;
      if (principal <= 0) break;
      if (principal > currentBalance) principal = currentBalance;
      totalInterest += interest;
      currentBalance -= principal;
      months++;
    }
    return Math.round(totalInterest * 100) / 100;
  }

  const payOffTime = calculatePayoffTime(balance, monthly, interest);
  const payOffTimeYrs = Math.round((payOffTime / 12) * 100) / 100;
  const totalInterestPaid = calculateTotalInterest(balance, monthly, interest);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      `INSERT INTO goals (Name, Description, Category, CurrentBalance, InterestRate, EstMonthlyPmt, PayOffTime, PayOffTimeYrs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [goalName, goalDescription, goalCategory, balance, interest, monthly, payOffTime, payOffTimeYrs]
    );
    await connection.end();
    res.status(201).json({ message: 'Goal added successfully.', id: result.insertId, payOffTime, payOffTimeYrs, totalInterestPaid });
  } catch (err) {
    console.error('Error adding goal:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a goal (PUT /api/goals/:id)
router.put('/:id', async (req, res) => {
  console.log('PUT /api/goals/:id called with id:', req.params.id);
  console.log('Request body:', req.body);

  const id = req.params.id;
  const { Name, name, Category, category, Description, description, CurrentBalance, InterestRate, EstMonthlyPmt } = req.body;
  // Use either capitalized or lowercase keys
  const goalName = Name || name || '';
  const goalCategory = Category || category || '';
  const goalDescription = Description || description || '';
  const balance = parseFloat(CurrentBalance) || 0;
  const interest = parseFloat(InterestRate) || 0;
  const monthly = parseFloat(EstMonthlyPmt) || 0;

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
  function calculateTotalInterest(balance, monthlyPayment, annualInterest) {
    if (monthlyPayment <= 0 || balance <= 0) return 0;
    const monthlyInterest = annualInterest / 100 / 12;
    let totalInterest = 0;
    let currentBalance = balance;
    let months = 0;
    while (currentBalance > 0 && months < 1000) {
      let interest = currentBalance * monthlyInterest;
      let principal = monthlyPayment - interest;
      if (principal <= 0) break;
      if (principal > currentBalance) principal = currentBalance;
      totalInterest += interest;
      currentBalance -= principal;
      months++;
    }
    return Math.round(totalInterest * 100) / 100;
  }

  const payOffTime = calculatePayoffTime(balance, monthly, interest);
  const payOffTimeYrs = Math.round((payOffTime / 12) * 100) / 100;
  const totalInterestPaid = calculateTotalInterest(balance, monthly, interest);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = `UPDATE goals SET Name=?, Category=?, Description=?, CurrentBalance=?, InterestRate=?, EstMonthlyPmt=?, PayOffTime=?, PayOffTimeYrs=? WHERE ID=?`;
    const params = [goalName, goalCategory, goalDescription, balance, interest, monthly, payOffTime, payOffTimeYrs, id];
    console.log('SQL:', sql);
    console.log('Params:', params);
    await connection.execute(sql, params);
    await connection.end();
    res.json({ message: 'Goal updated successfully.', payOffTime, payOffTimeYrs, totalInterestPaid });
  } catch (err) {
    console.error('Error updating goal:', err);
    console.error('Request body:', req.body);
    console.error('SQL:', `UPDATE goals SET Name=?, Category=?, Description=?, CurrentBalance=?, InterestRate=?, EstMonthlyPmt=?, PayOffTime=?, PayOffTimeYrs=? WHERE ID=?`);
    console.error('Params:', [goalName, goalCategory, goalDescription, balance, interest, monthly, payOffTime, payOffTimeYrs, id]);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

router.delete('/:id', (req, res) => {
  goals = goals.filter(g => g.id !== parseInt(req.params.id));
  res.status(204).end();
});

module.exports = router;
