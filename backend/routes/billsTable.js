const express = require('express');
const router = express.Router();

// Mock data for bills table
const billsData = [
  { id: 1, name: 'Electricity Bill', amount: 100, dueDate: '2023-10-15' },
  { id: 2, name: 'Water Bill', amount: 50, dueDate: '2023-10-20' },
  { id: 3, name: 'Internet Bill', amount: 75, dueDate: '2023-10-25' },
];

// GET /api/bills-table
router.get('/', (req, res) => {
  res.json(billsData);
});

module.exports = router;
