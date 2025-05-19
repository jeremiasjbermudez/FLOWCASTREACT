import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper, Button, IconButton, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function getDefaultDates() {
  const today = new Date();
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  let defaultEnd = (day >= 16)
    ? new Date(year, month, 30).toISOString().slice(0, 10)
    : new Date(year, month, 15).toISOString().slice(0, 10);
  return { defaultStart: '', defaultEnd };
}

function Habits() {
  const { defaultStart, defaultEnd } = getDefaultDates();
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [form, setForm] = useState({ name: '', category: '' });
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/habits/categories')
      .then(res => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const params = [];
    if (start) params.push(`start=${start}`);
    if (end) params.push(`end=${end}`);
    if (selectedCats.length === 1) params.push(`category=${encodeURIComponent(selectedCats[0])}`);
    fetch(`/api/habits${params.length ? '?' + params.join('&') : ''}`)
      .then(res => res.json())
      .then(setHabits)
      .catch(() => setError('Failed to load habits'))
      .finally(() => setLoading(false));
  }, [start, end, selectedCats]);

  const handleAdd = e => {
    e.preventDefault();
    fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(() => { setForm({ name: '', category: '' }); setLoading(true); setTimeout(() => setLoading(false), 500); });
  };

  const handleEdit = row => {
    setEditRow(row.id);
    setEditForm(row);
  };
  const handleEditSave = e => {
    e.preventDefault();
    fetch(`/api/habits/${editRow}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    })
      .then(() => { setEditRow(null); setLoading(true); setTimeout(() => setLoading(false), 500); });
  };

  const handleDelete = id => {
    fetch(`/api/habits/${id}`, { method: 'DELETE' })
      .then(() => { setLoading(true); setTimeout(() => setLoading(false), 500); });
  };
  const handleDeleteCategory = cat => {
    fetch(`/api/habits/category/${encodeURIComponent(cat)}`, { method: 'DELETE' })
      .then(() => { setLoading(true); setTimeout(() => setLoading(false), 500); });
  };

  const handleSelectAll = () => setSelectedCats(categories);
  const handleClearAll = () => setSelectedCats([]);
  const handleCategoryChange = e => {
    setSelectedCats(e.target.value);
  };

  const grouped = habits.reduce((acc, h) => {
    acc[h.Category] = acc[h.Category] || [];
    acc[h.Category].push(h);
    return acc;
  }, {});

  const totals = Object.fromEntries(
    Object.entries(grouped).map(([cat, rows]) => [cat, rows.reduce((sum, r) => sum + (parseFloat(r.Withdrawals) || 0), 0)])
  );
  const totalSelected = selectedCats.length === 0
    ? Object.values(totals).reduce((a, b) => a + b, 0)
    : selectedCats.reduce((sum, cat) => sum + (totals[cat] || 0), 0);

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Habits
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0 }}>
            <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
              <CardContent sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                  Habit Tracker
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <form className="row g-2 align-items-center" onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <TextField name="name" label="Habit Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} size="small" sx={{ width: 180 }} />
                      <TextField name="category" label="Category" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} size="small" sx={{ width: 180 }} />
                      <Button
                        variant="contained"
                        sx={{ background: '#5b47fb', '&:hover': { background: '#4a3ecb' } }}
                        onClick={handleAdd}
                      >
                        Add Habit
                      </Button>
                    </form>
                  </Paper>
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <TextField
                        label="Start Date"
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <TextField
                        label="End Date"
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Box>
                    <FormControl sx={{ minWidth: 220, mr: 2 }} size="small">
                      <InputLabel id="categoryFilter-label">Select Habit Categories</InputLabel>
                      <Select
                        labelId="categoryFilter-label"
                        multiple
                        value={selectedCats}
                        onChange={handleCategoryChange}
                        input={<OutlinedInput label="Select Habit Categories" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                      >
                        {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Button size="small" variant="outlined" onClick={handleSelectAll} sx={{ mr: 1 }}>Select All</Button>
                    <Button size="small" variant="outlined" onClick={handleClearAll}>Clear All</Button>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>Total Habit Expense: ${totalSelected.toFixed(2)}</Typography>
                  </Paper>
                  {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> : error ? <Typography color="error">{error}</Typography> : (
                    <Grid container columns={12} columnSpacing={3} rowSpacing={3}>
                      {Object.entries(grouped).map(([cat, rows]) => (
                        <Grid gridColumn={{ xs: 'span 12', md: 'span 6', lg: 'span 4' }} key={cat}>
                          <Card elevation={3} sx={{ maxHeight: 520, minWidth: 300, display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
                              <Box className="card-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" color="primary" fontWeight={700}>{cat}</Typography>
                                <IconButton color="error" onClick={() => handleDeleteCategory(cat)}><DeleteIcon /></IconButton>
                              </Box>
                              <Typography variant="subtitle2" align="right" sx={{ mb: 2 }}>Total: ${totals[cat].toFixed(2)}</Typography>
                              <Box className="table-responsive">
                                <table className="table table-bordered table-sm align-middle modern-table" style={{ minWidth: 350 }}>
                                  <thead className="purple-header"><tr><th>Name</th><th>Date</th><th>Withdrawals</th><th>Actions</th></tr></thead>
                                  <tbody>
                                    {rows.map(r => editRow === r.id ? (
                                      <tr key={r.id}>
                                        <td><TextField size="small" value={editForm.Name || ''} onChange={e => setEditForm(f => ({ ...f, Name: e.target.value }))} /></td>
                                        <td><TextField size="small" type="date" value={editForm.Date || ''} onChange={e => setEditForm(f => ({ ...f, Date: e.target.value }))} InputLabelProps={{ shrink: true }} /></td>
                                        <td><TextField size="small" type="number" step="0.01" value={editForm.Withdrawals || ''} onChange={e => setEditForm(f => ({ ...f, Withdrawals: e.target.value }))} /></td>
                                        <td className="text-nowrap">
                                          <Button variant="contained" color="primary" size="small" onClick={handleEditSave}>💾</Button>
                                          <Button variant="outlined" color="secondary" size="small" onClick={() => setEditRow(null)}>Cancel</Button>
                                        </td>
                                      </tr>
                                    ) : (
                                      <tr key={r.id}>
                                        <td>{r.Name}</td>
                                        <td>{r.Date}</td>
                                        <td>${Number(r.Withdrawals).toFixed(2)}</td>
                                        <td className="text-nowrap">
                                          <IconButton color="warning" onClick={() => handleEdit(r)}><EditIcon /></IconButton>
                                          <IconButton color="error" onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
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

export default Habits;
