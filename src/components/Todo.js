import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Todo() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', due_date: '', cost: '', description: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchTodos = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/todo`)
      .then(res => res.json())
      .then(data => { setTodos(data); setLoading(false); })
      .catch(() => { setError('Failed to load todos'); setLoading(false); });
  };

  useEffect(() => { fetchTodos(); }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => { setForm({ name: '', due_date: '', cost: '', description: '', notes: '' }); fetchTodos(); });
  };

  const handleDelete = (id) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/todo/${id}`, { method: 'DELETE' })
      .then(() => fetchTodos());
  };

  const handleEdit = (todo) => {
    setEditId(todo.id);
    setEditForm({ ...todo });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/todo/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    })
      .then(res => res.json())
      .then(() => { setEditId(null); setEditForm({}); fetchTodos(); });
  };

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Todo
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0 }}>
            <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
              <CardContent sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                  Todo List
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <TextField name="name" label="Task Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} size="small" sx={{ width: 160 }} />
                      <TextField name="due_date" label="Due Date" type="date" required value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} size="small" sx={{ width: 140 }} InputLabelProps={{ shrink: true }} />
                      <TextField name="cost" label="Cost" type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} size="small" sx={{ width: 100 }} />
                      <TextField name="description" label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} size="small" sx={{ width: 180 }} />
                      <TextField name="notes" label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} size="small" sx={{ width: 180 }} />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ background: '#5b47fb', '&:hover': { background: '#4a3ecb' } }}
                      >
                        Add
                      </Button>
                    </form>
                  </Paper>
                  {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> : error ? <Typography color="error">{error}</Typography> : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <table className="table table-bordered" style={{ minWidth: 650 }}>
                        <thead>
                          <tr>
                            <th className="text-center">Done</th>
                            <th>Task</th>
                            <th>Due Date</th>
                            <th>Cost</th>
                            <th>Description</th>
                            <th>Notes</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todos.map(todo => editId === todo.id ? (
                            <tr key={todo.id}>
                              <td></td>
                              <td><TextField size="small" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                              <td><TextField size="small" type="date" value={editForm.due_date || ''} onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))} InputLabelProps={{ shrink: true }} /></td>
                              <td><TextField size="small" type="number" step="0.01" value={editForm.cost || ''} onChange={e => setEditForm(f => ({ ...f, cost: e.target.value }))} /></td>
                              <td><TextField size="small" value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></td>
                              <td><TextField size="small" value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></td>
                              <td className="d-grid gap-2">
                                <Button variant="contained" color="primary" size="small" onClick={handleEditSave}>Save</Button>
                                <Button variant="outlined" color="secondary" size="small" onClick={() => setEditId(null)}>Cancel</Button>
                              </td>
                            </tr>
                          ) : (
                            <tr key={todo.id}>
                              <td className="text-center">
                                <input type="checkbox" onChange={() => handleDelete(todo.id)} />
                              </td>
                              <td>{todo.name}</td>
                              <td>{todo.due_date}</td>
                              <td>${Number(todo.cost).toFixed(2)}</td>
                              <td>{todo.description}</td>
                              <td>{todo.notes}</td>
                              <td className="text-center">
                                <IconButton color="warning" onClick={() => handleEdit(todo)}><EditIcon /></IconButton>
                                <IconButton color="error" onClick={() => handleDelete(todo.id)}><DeleteIcon /></IconButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Todo;
