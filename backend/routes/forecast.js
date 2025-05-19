const express = require('express');
const router = express.Router();

// Mock data for forecast
let forecast = [
  { id: 1, name: 'Checking', projected: 3000 },
  { id: 2, name: 'Savings', projected: 12000 }
];

router.get('/', (req, res) => {
  res.json(forecast);
});

module.exports = router;
