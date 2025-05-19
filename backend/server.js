const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 4000;

// Optional logging to backend.log
const logFile = path.join(__dirname, 'backend.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function logToFile(...args) {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  logStream.write(`[${new Date().toISOString()}] ${msg}\n`);
}

const origLog = console.log;
const origError = console.error;
console.log = (...args) => { origLog(...args); logToFile(...args); };
console.error = (...args) => { origError(...args); logToFile(...args); };

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('🚀 Flowcast backend is alive'));

app.use('/api/bills', require('./routes/bills'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/bills-paid', require('./routes/billsPaid'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/todo', require('./routes/todo'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/update-tables', require('./routes/update-tables'));
app.use('/api/accounts-data', require('./routes/accounts-data'));
app.use('/api/bills-table', require('./routes/bills-table'));
app.use('/api/expenses-table', require('./routes/expenses-table'));
app.use('/api/deposits-table', require('./routes/deposits-table'));
app.use('/api/goals-table', require('./routes/goals-table'));
app.use('/api/forecast-table', require('./routes/forecast-table'));
app.use('/api/refresh-forecast', require('./routes/refresh-forecast'));
app.use('/api/reserve-balance', require('./routes/reserve-balance'));
app.use('/api', require('./routes/reserve-chart'));
app.use('/api', require('./routes/spending-chart'));
app.use('/api', require('./routes/goalswd'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
