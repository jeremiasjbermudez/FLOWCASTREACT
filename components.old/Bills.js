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
  ContainsText: '',
  DayOfMonth: [''], // multi-date support
};

function Bills() {
  const [bills, setBills] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);

  // Fetch bills
  useEffect(() => {
    const params = [];
    if (start) params.push(`start=${start}`);
    if (end) params.push(`end=${end}`);
    if (search) params.push(`q=${encodeURIComponent(search)}`);
    setLoading(true);
    fetch(`/api/bills-table${params.length ? '?' + params.join('&') : ''}`)
      .then(res => res.json())
      .then(setBills)
      .catch(() => setError('Failed to load bills'))
      .finally(() => setLoading(false));
  }, [search, start, end]);

  // Add Bill
  const handleAddBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, DayOfMonth: form.DayOfMonth.filter(Boolean) })
      });
      if (!resp.ok) {
        const err = await resp.json();
        setError(err.error || 'Failed to add bill');
        setLoading(false);
        return;
      }
      setForm(initialForm);
      setAddOpen(false);
      // Refresh
      const params = [];
      if (start) params.push(`start=${start}`);
      if (end) params.push(`end=${end}`);
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      fetch(`/api/bills-table${params.length ? '?' + params.join('&') : ''}`)
        .then(res => res.json())
        .then(setBills);
    } catch (err) {
      setError('Failed to add bill');
    } finally {
      setLoading(false);
    }
  };

  // Edit Bill
  const handleEditSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure DayOfMonth is in yyyy-MM-dd format
      let day = editForm.DayOfMonth && editForm.DayOfMonth[0];
      if (day) {
        // If it's a Date object or ISO string, convert to yyyy-MM-dd
        if (typeof day === 'string' && day.includes('T')) {
          day = day.split('T')[0];
        }
      }
      const payload = { ...editForm, DayOfMonth: day };
      await fetch(`/api/bills/${editRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditRow(null);
      setEditForm(initialForm);
      // Refresh
      const params = [];
      if (start) params.push(`start=${start}`);
      if (end) params.push(`end=${end}`);
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      fetch(`/api/bills-table${params.length ? '?' + params.join('&') : ''}`)
        .then(res => res.json())
        .then(setBills);
    } catch (err) {
      setError('Failed to update bill');
    } finally {
      setLoading(false);
    }
  };

  // Delete Bill
  const handleDelete = async (row) => {
    if (!window.confirm('Delete this bill?')) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/bills/${row.id}`, { method: 'DELETE' });
      // Refresh
      const params = [];
      if (start) params.push(`start=${start}`);
      if (end) params.push(`end=${end}`);
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      fetch(`/api/bills-table${params.length ? '?' + params.join('&') : ''}`)
        .then(res => res.json())
        .then(setBills);
    } catch (err) {
      setError('Failed to delete bill');
    } finally {
      setLoading(false);
    }
  };

  // Add date field for multi-date add
  const handleAddDateField = () => {
    setForm(f => ({ ...f, DayOfMonth: [...f.DayOfMonth, ''] }));
  };
  const handleRemoveDateField = (idx) => {
    setForm(f => ({ ...f, DayOfMonth: f.DayOfMonth.filter((_, i) => i !== idx) }));
  };

  // Render
  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Bills
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          {ACCOUNTS.map(({ key, label }) => (
            <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0 }} key={key}>
              <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                    {label} Bills
                  </Typography>
                  <Box sx={{ height: 220, width: '100%' }}>
                    <DataGrid
                      rows={(bills[key] || []).filter(row => row.id != null).map(row => ({ ...row, id: row.id }))}
                      columns={[
                        { field: 'Bill', headerName: 'Bill', width: 140, editable: false },
                        { field: 'Amount', headerName: 'Amount', width: 100, type: 'number', editable: false },
                        { field: 'DayOfMonth', headerName: 'Due Date', width: 110, editable: false },
                        { field: 'ContainsText', headerName: 'ContainsText', width: 140, editable: false },
                        { field: 'Account', headerName: 'Account', width: 100, editable: false },
                        {
                          field: 'actions',
                          headerName: 'Actions',
                          width: 120,
                          sortable: false,
                          renderCell: (params) => (
                            editRow && editRow.id === params.row.id ? (
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
                                    ContainsText: params.row.ContainsText,
                                    DayOfMonth: [params.row.DayOfMonth],
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
                      sx={{ background: '#f9fafb', borderRadius: 2, border: '1px solid #e3e7ed', fontSize: 13, '& .MuiDataGrid-columnHeaders': { background: '#ede7f6', color: '#5b47fb', fontWeight: 700, fontSize: 13 }, '& .MuiDataGrid-row': { background: '#fff' }, '& .MuiDataGrid-footerContainer': { background: '#ede7f6' }, '& .MuiDataGrid-cell': { color: '#222b45' } }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Edit Bill Dialog */}
      <Dialog open={!!editRow} onClose={() => setEditRow(null)}>
        <DialogTitle>Edit Bill</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, minWidth: 350 }}>
            <TextField label="Bill Name" value={editForm.Bill} onChange={e => setEditForm(f => ({ ...f, Bill: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Amount" type="number" value={editForm.Amount} onChange={e => setEditForm(f => ({ ...f, Amount: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
            <TextField label="ContainsText" value={editForm.ContainsText} onChange={e => setEditForm(f => ({ ...f, ContainsText: e.target.value }))} fullWidth sx={{ mb: 2 }} />
            <TextField select label="Account" value={editForm.Account} onChange={e => setEditForm(f => ({ ...f, Account: e.target.value }))} fullWidth sx={{ mb: 2 }}>
              {ACCOUNTS.map(a => <MenuItem key={a.key} value={a.key}>{a.label}</MenuItem>)}
            </TextField>
            <TextField label="Due Date" type="date" value={editForm.DayOfMonth[0] || ''} onChange={e => setEditForm(f => ({ ...f, DayOfMonth: [e.target.value] }))} required sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
            <DialogActions>
              <Button onClick={() => setEditRow(null)}>Cancel</Button>
              <Button type="button" variant="contained" onClick={handleEditSave}>Save</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Bills;
