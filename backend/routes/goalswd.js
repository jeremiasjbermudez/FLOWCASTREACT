const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'pncaccounts',
};

// GET /api/goalswd
router.get('/', async (req, res) => {
  const { goalId } = req.query;

  if (!goalId) {
    return res.status(400).json({ error: 'goalId is required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Fetch the goal's Name using the provided goalId
    const goalQuery = 'SELECT Name FROM goals WHERE id = ?';
    const [goalResult] = await connection.execute(goalQuery, [goalId]);

    if (goalResult.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goalName = goalResult[0].Name;

    // Fetch transactions from goalswd table where Description matches the goal's Name
    const transactionsQuery = `
      SELECT * FROM goalswd WHERE Description LIKE CONCAT('%', ?, '%')
      ORDER BY PayDate DESC
    `;

    const [transactions] = await connection.execute(transactionsQuery, [goalName]);

    await connection.end();

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions from goalswd:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/populate-goalswd
router.post('/populate-goalswd', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Fetch all goals
    const [goals] = await connection.execute('SELECT Name FROM goals');

    if (goals.length === 0) {
      return res.status(404).json({ error: 'No goals found' });
    }

    const tables = ['reserve', 'spending', 'growth'];

    for (const table of tables) {
      const [rows] = await connection.execute(`SELECT * FROM ${table}`);

      for (const row of rows) {
        for (const goal of goals) {
          if (row.Description.includes(goal.Name)) {
            const amount = row.Deposits > 0 ? row.Deposits : row.Withdrawals;
            const type = row.Deposits > 0 ? 'Deposit' : 'Withdraw';

            // Avoid duplicates
            const [exists] = await connection.execute(
              'SELECT COUNT(*) AS count FROM goalswd WHERE Goal = ? AND PayDate = ? AND Amount = ? AND Description = ?',
              [goal.Name, row.Date, amount, row.Description]
            );

            if (exists[0].count === 0) {
              await connection.execute(
                'INSERT INTO goalswd (Goal, Type, Amount, PayDate, Description) VALUES (?, ?, ?, ?, ?)',
                [goal.Name, type, amount, row.Date, row.Description]
              );
            }

            break; // Only insert once per matching goal
          }
        }
      }
    }

    await connection.end();
    res.status(200).json({ message: 'Goalswd table populated successfully' });
  } catch (error) {
    console.error('Error populating goalswd table:', error);
    res.status(500).json({ error: 'Failed to populate goalswd table' });
  }
});

module.exports = router;
