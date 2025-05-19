// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

// Set up logging to backend/backend.log
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

app.use(cors());
app.use(express.json());

const billsRouter = require('./routes/bills');
app.use('/api/bills', billsRouter);

const expensesRouter = require('./routes/expenses');
app.use('/api/expenses', expensesRouter);

const depositsRouter = require('./routes/deposits');
app.use('/api/deposits', depositsRouter);

const goalsRouter = require('./routes/goals');
app.use('/api/goals', goalsRouter);

const forecastRouter = require('./routes/forecast');
app.use('/api/forecast', forecastRouter);

const billsPaidRouter = require('./routes/billsPaid');
app.use('/api/bills-paid', billsPaidRouter);

const calendarRouter = require('./routes/calendar');
app.use('/api/calendar', calendarRouter);

const todoRouter = require('./routes/todo');
app.use('/api/todo', todoRouter);

const habitsRouter = require('./routes/habits');
app.use('/api/habits', habitsRouter);

const accountsRouter = require('./routes/accounts');
app.use('/api/accounts', accountsRouter);

const updateTablesRouter = require('./routes/update-tables');
app.use('/api/update-tables', updateTablesRouter);

const accountsDataRouter = require('./routes/accounts-data');
app.use('/api/accounts-data', accountsDataRouter);

const billsTableRouter = require('./routes/bills-table');
app.use('/api/bills-table', billsTableRouter);

const expensesTableRouter = require('./routes/expenses-table');
app.use('/api/expenses-table', expensesTableRouter);

const depositsTableRouter = require('./routes/deposits-table');
app.use('/api/deposits-table', depositsTableRouter);

const goalsTableRouter = require('./routes/goals-table');
app.use('/api/goals-table', goalsTableRouter);

const forecastTableRouter = require('./routes/forecast-table');
app.use('/api/forecast-table', forecastTableRouter);

const refreshForecastRouter = require('./routes/refresh-forecast');
app.use('/api/refresh-forecast', refreshForecastRouter);

const reserveBalanceRouter = require('./routes/reserve-balance');
app.use('/api/reserve-balance', reserveBalanceRouter);

const reserveChartRoutes = require('./routes/reserve-chart');
app.use('/api', reserveChartRoutes);

const spendingChartRoute = require("./routes/spending-chart");
app.use('/api', spendingChartRoute);

const goalswdRouter = require('./routes/goalswd');
app.use('/api', goalswdRouter);

// Example route for accounts (replace with DB logic as needed)
app.get('/api/accounts', (req, res) => {
  res.json([
    { id: 1, name: 'Checking', balance: 2500, type: 'spending' },
    { id: 2, name: 'Savings', balance: 10000, type: 'reserve' },
    { id: 3, name: 'Investment', balance: 15000, type: 'growth' }
  ]);
});

// TODO: Add routes for bills, expenses, deposits, goals, etc.

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
