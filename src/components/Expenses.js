import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ACCOUNTS = [
  { key: 'spending', label: 'Spending' },
  { key: 'reserve', label: 'Reserve' },
  { key: 'growth', label: 'Growth' },
];

const initialForm = {
  Bill: '',
  Amount: '',
  Account: 'spending',
  DateAdded: [''], // multi-date support
};

function Expenses() {
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);

  // Fetch expenses
  useEffect(() => {
    setLoading(true);
    fetch(`/api/expenses-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
      .then(res => res.json())
      .then(setExpenses)
      .catch(() => setError('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [search]);

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, DateAdded: form.DateAdded.filter(Boolean) })
      });
      setForm(initialForm);
      setAddOpen(false);
      fetch(`/api/expenses-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setExpenses);
    } catch (err) {
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // Edit Expense
  const handleEditSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/expenses/${editRow.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setEditRow(null);
      setEditForm(initialForm);
      fetch(`/api/expenses-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setExpenses);
    } catch (err) {
      setError('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  // Delete Expense
  const handleDelete = async (row) => {
    if (!window.confirm('Delete this expense?')) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/expenses/${row.ID}`, { method: 'DELETE' });
      fetch(`/api/expenses-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setExpenses);
    } catch (err) {
      setError('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  // Add date field for multi-date add
  const handleAddDateField = () => {
    setForm(f => ({ ...f, DateAdded: [...f.DateAdded, ''] }));
  };
  const handleRemoveDateField = (idx) => {
    setForm(f => ({ ...f, DateAdded: f.DateAdded.filter((_, i) => i !== idx) }));
  };

  // Render
  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Expenses
        </Typography>
        <Paper sx={{ p: 2, mb: 4, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, background: '#fff', maxWidth: 420, border: '1px solid #e3e7ed', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField label="Search" variant="outlined" size="small" value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 250 }} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ ml: 'auto', background: '#5b47fb', '&:hover': { background: '#4a3ecb' } }}>Add Expense</Button>
        </Paper>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {/* Add Expense Dialog */}
        <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleAddExpense} sx={{ mt: 1, minWidth: 350 }}>
              <TextField label="Bill Name" value={form.Bill} onChange={e => setForm(f => ({ ...f, Bill: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Amount" type="number" value={form.Amount} onChange={e => setForm(f => ({ ...f, Amount: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
              <TextField select label="Account" value={form.Account} onChange={e => setForm(f => ({ ...f, Account: e.target.value }))} fullWidth sx={{ mb: 2 }}>
                {ACCOUNTS.map(a => <MenuItem key={a.key} value={a.key}>{a.label}</MenuItem>)}
              </TextField>
              {form.DateAdded.map((date, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField label="Date" type="date" value={date} onChange={e => setForm(f => ({ ...f, DateAdded: f.DateAdded.map((d, i) => i === idx ? e.target.value : d) }))} required sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
                  {form.DateAdded.length > 1 && (
                    <IconButton onClick={() => handleRemoveDateField(idx)}><DeleteIcon /></IconButton>
                  )}
                </Box>
              ))}
              <Button onClick={handleAddDateField} startIcon={<AddIcon />} sx={{ mb: 2 }}>Add Date</Button>
              <DialogActions>
                <Button onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Add</Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="secondary" /></Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {ACCOUNTS.map(({ key, label }) => (
              <Grid item xs={12} md={4} key={key} sx={{ display: 'flex', minWidth: 0 }}>
                <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                  <CardContent sx={{ p: 2, pb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                      {label} Expenses
                    </Typography>
                    <Box sx={{ height: 220, width: '100%' }}>
                      <DataGrid
                        rows={(expenses[key] || []).map((row, i) => ({ ...row, id: row.ID }))}
                        columns={[
                          { field: 'Bill', headerName: 'Bill', width: 90, editable: false, headerClassName: 'purple-header' },
                          { field: 'Amount', headerName: 'Amount', width: 80, type: 'number', editable: false, headerClassName: 'purple-header' },
                          { field: 'DateAdded', headerName: 'Date', width: 80, editable: false, headerClassName: 'purple-header' },
                          { field: 'Account', headerName: 'Account', width: 80, editable: false, headerClassName: 'purple-header' },
                          {
                            field: 'actions',
                            headerName: 'Actions',
                            width: 80,
                            sortable: false,
                            renderCell: (params) => (
                              editRow && editRow.ID === params.row.ID ? (
                                <>
                                  <Button color="primary" size="small" onClick={handleEditSave}>Save</Button>
                                  <Button color="secondary" size="small" onClick={() => setEditRow(null)}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <IconButton color="primary" onClick={() => {
                                    setEditRow(params.row);
                                    setEditForm({
                                      Bill: params.row.Bill,
                                      Amount: params.row.Amount,
                                      Account: params.row.Account,
                                      DateAdded: [params.row.DateAdded],
                                    });
                                  }}><EditIcon /></IconButton>
                                  <IconButton color="error" onClick={() => handleDelete(params.row)}><DeleteIcon /></IconButton>
                                </>
                              )
                            )
                          },
                        ]}
                        pageSize={3}
                        rowsPerPageOptions={[3]}
                        disableSelectionOnClick
                        sx={{ background: '#f9fafb', borderRadius: 2, border: '1px solid #e3e7ed', fontSize: 13, '& .MuiDataGrid-columnHeaders': { background: '#ede7f6', color: '#5b47fb', fontWeight: 700, fontSize: 13 }, '& .MuiDataGrid-row': { background: '#fff' }, '& .MuiDataGrid-footerContainer': { background: '#ede7f6' }, '& .MuiDataGrid-cell': { color: '#222b45' }, '& .purple-header': { color: '#5b47fb' } }}
                        onCellEditCommit={params => {
                          // Inline editing logic if needed
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Expenses;
