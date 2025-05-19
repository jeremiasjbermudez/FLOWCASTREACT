// backend/routes/goals-table.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // or your MySQL user
  password: '', // or your MySQL password
  database: 'pncaccounts',
};

// GET /api/goals-table
router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connection established');

    try {
      // Log the schema and sample data of the goals table
      const [schema] = await connection.execute('DESCRIBE goals');
      console.log('Goals table schema:', schema);

      const [sampleData] = await connection.execute('SELECT * FROM goals LIMIT 5');
      console.log('Sample data from goals table:', sampleData);
    } catch (schemaError) {
      console.error('Error fetching schema or sample data:', schemaError);
      throw schemaError;
    }

    let sql = 'SELECT * FROM goals';
    let params = [];
    if (q) {
      sql += ' WHERE Name LIKE ? OR Description LIKE ?';
      params.push(`%${q}%`, `%${q}%`);
    }

    try {
      // Fetch filtered goals
      const [goals] = await connection.execute(sql, params);
      console.log('Fetched goals:', goals);

      // For each goal, fetch its transactions from the goalswd table
      for (const goal of goals) {
        try {
          const [transactions] = await connection.execute(
            'SELECT * FROM goalswd WHERE Description LIKE CONCAT(\'%\', ?, \'%\')',
            [goal.Name]
          );
          goal.transactions = transactions;
        } catch (transactionError) {
          console.error(`Error fetching transactions for goal ${goal.Name}:`, transactionError);
          goal.transactions = [];
        }
      }

      res.json(goals);
    } catch (queryError) {
      console.error('Error executing goals query:', queryError);
      res.status(500).json({ error: 'Failed to fetch goals' });
    } finally {
      await connection.end();
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error in /api/goals-table:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals-table
router.post('/', async (req, res) => {
  try {
    const { name, custom4 } = req.body;
    if (!name || custom4 === undefined) {
      return res.status(400).json({ error: 'Name and custom4 are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO goals (Name, Custom4) VALUES (?, ?) ON DUPLICATE KEY UPDATE Custom4 = ?',
      [name, custom4, custom4]
    );

    res.status(200).json({ message: 'Goal added or updated successfully' });
  } catch (err) {
    console.error('Error in POST /api/goals-table:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a route to save chart data
router.post('/save-chart', async (req, res) => {
  try {
    const { name, custom4, balance } = req.body;
    if (!name || custom4 === undefined || balance === undefined) {
      return res.status(400).json({ error: 'Name, custom4, and balance are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO goals (Name, Custom4, Balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Custom4 = ?, Balance = ?',
      [name, custom4, balance, custom4, balance]
    );

    res.status(200).json({ message: 'Chart data saved successfully' });
  } catch (err) {
    console.error('Error in POST /api/goals-table/save-chart:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a route to retrieve all chart data
router.get('/charts', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'SELECT Name AS name, Custom4 AS goalAmount, CurrentBalance AS balance, PayoffTime, PayOffTimeYrs FROM goals WHERE Custom4 IS NOT NULL';
    console.log('Executing query with aliases:', query);

    const [charts] = await connection.execute(query);
    console.log('Raw query results:', charts);

    // Log detailed query results to confirm mapping
    console.log('Detailed query results:', charts);

    // Ensure proper mapping of fields
    const mappedCharts = charts.map(chart => ({
      name: chart.name,
      goalAmount: chart.goalAmount,
      balance: chart.balance,
      payoffTime: chart.PayoffTime,
      payoffTimeYrs: chart.PayOffTimeYrs,
    }));
    console.log('Mapped charts:', mappedCharts);

    res.status(200).json(mappedCharts);
  } catch (err) {
    console.error('Error in GET /api/goals-table/charts:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals-table/:name
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    // Set Custom4 to NULL for the goal with the given NAME
    await connection.execute('UPDATE goals SET Custom4 = NULL WHERE NAME = ?', [name]);

    res.json({ message: 'Custom4 field set to NULL successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/goals-table/:name:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
