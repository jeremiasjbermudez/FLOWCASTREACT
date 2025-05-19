require('dotenv').config(); // Load .env variables

console.log('🧪 Starting Flowcast backend...');

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Optional logging to backend.log
const logFile = path.join(__dirname, 'backend.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
function logToFile(...args) {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  logStream.write(`[${new Date().toISOString()}] ${msg}\n`);
}
console.log = (...args) => { logToFile(...args); };
console.error = (...args) => { logToFile(...args); };

// Middleware
app.use(cors());
app.use(express.json());

// === API Routes ===
app.use('/api/bills', require('./backend/routes/bills'));
app.use('/api/expenses', require('./backend/routes/expenses'));
app.use('/api/deposits', require('./backend/routes/deposits'));
app.use('/api/goals', require('./backend/routes/goals'));
app.use('/api/forecast', require('./backend/routes/forecast'));
app.use('/api/bills-paid', require('./backend/routes/billsPaid'));
app.use('/api/calendar', require('./backend/routes/calendar'));
app.use('/api/todo', require('./backend/routes/todo'));
app.use('/api/habits', require('./backend/routes/habits'));
app.use('/api/accounts', require('./backend/routes/accounts'));
app.use('/api/update-tables', require('./backend/routes/update-tables'));
app.use('/api/accounts-data', require('./backend/routes/accounts-data'));
app.use('/api/bills-table', require('./backend/routes/bills-table'));
app.use('/api/expenses-table', require('./backend/routes/expenses-table'));
app.use('/api/deposits-table', require('./backend/routes/deposits-table'));
app.use('/api/goals-table', require('./backend/routes/goals-table'));
app.use('/api/forecast-table', require('./backend/routes/forecast-table'));
app.use('/api/refresh-forecast', require('./backend/routes/refresh-forecast'));
app.use('/api/reserve-balance', require('./backend/routes/reserve-balance'));
app.use('/api', require('./backend/routes/reserve-chart'));
app.use('/api', require('./backend/routes/spending-chart'));
app.use('/api', require('./backend/routes/goalswd'));

// === Serve Frontend ===
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// fallback to index.html for any unmatched routes (React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
const path = require('path');

// Serve frontend build
app.use(express.static(path.join(__dirname, '../build')));

// Handle React routes (like /dashboard, /goals, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});