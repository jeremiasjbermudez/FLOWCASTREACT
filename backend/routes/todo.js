const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root', // update as needed
  password: '', // update as needed
  database: 'pncaccounts',
};

// Get all todos
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM Todo ORDER BY due_date ASC');
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Error in GET /api/todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new todo
router.post('/', async (req, res) => {
  const { name, due_date, cost, description, notes } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO Todo (name, due_date, cost, description, notes) VALUES (?, ?, ?, ?, ?)',
      [name, due_date, cost, description, notes]
    );
    const [rows] = await connection.execute('SELECT * FROM Todo WHERE id = ?', [result.insertId]);
    await connection.end();
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error in POST /api/todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update todo
router.put('/:id', async (req, res) => {
  const { name, due_date, cost, description, notes } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE Todo SET name=?, due_date=?, cost=?, description=?, notes=? WHERE id=?',
      [name, due_date, cost, description, notes, req.params.id]
    );
    const [rows] = await connection.execute('SELECT * FROM Todo WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in PUT /api/todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete todo (mark as done)
router.delete('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM Todo WHERE id = ?', [req.params.id]);
    await connection.end();
    res.status(204).end();
  } catch (err) {
    console.error('Error in DELETE /api/todo:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
