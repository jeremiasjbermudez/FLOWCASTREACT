import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

function getCategoryColor(category) {
  // Assign different purple shades based on the goal name/category
  const normalized = (category || '').toLowerCase().trim();
  switch (normalized) {
    case 'credit card':
      return { bg: '#ede7f6', color: '#5b47fb' }; // light purple bg, main purple text
    case 'savings':
      return { bg: '#e1d7fa', color: '#7c4dff' }; // slightly deeper purple
    case 'emergency':
      return { bg: '#e3e0f7', color: '#9575cd' }; // muted purple
    case 'vacation':
      return { bg: '#f3e8fd', color: '#8e24aa' }; // lavender purple
    case 'retirement':
      return { bg: '#f1e6ff', color: '#512da8' }; // deep purple
    case 'education':
      return { bg: '#ede7f6', color: '#512da8' }; // same as credit card, but deep text
    default:
      return { bg: '#f4f6fb', color: '#5b47fb' }; // fallback to main theme
  }
}

function Goals() {
  const theme = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading,] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', description: '', category: '', CurrentBalance: '', InterestRate: '', EstMonthlyPmt: '' });
  const [txForm, setTxForm] = useState({ type: 'Deposit', goal: '', amount: '', paydate: '', description: '' });
  const [editTx, setEditTx] = useState(null);
  const [editTxForm, setEditTxForm] = useState({});
  const [editGoal, setEditGoal] = useState(null);
  const [editGoalForm, setEditGoalForm] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
      .then(res => res.json())
      .then(setGoals)
      .catch(() => setError('Failed to load goals'))
      .finally(() => setLoading(false));
  }, [search]);

  // Add/Edit/Delete Goal logic
  const handleAddGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalForm)
      });
      setGoalForm({ name: '', description: '', category: '', CurrentBalance: '', InterestRate: '', EstMonthlyPmt: '' });
      setAddGoalOpen(false);
      fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setGoals);
    } catch (err) {
      setError('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoalSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to find the correct ID for the goal (ID or id)
      const goalId = editGoal.ID || editGoal.id;
      if (!goalId) {
        setError('Goal ID missing, cannot update.');
        setLoading(false);
        return;
      }
      await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGoalForm)
      });
      setEditGoal(null);
      setEditGoalForm({});
      fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setGoals);
    } catch (err) {
      setError('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm('Delete this goal?')) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/goals/${goal.id}`, { method: 'DELETE' });
      fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setGoals);
    } catch (err) {
      setError('Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  // Add Deposit/Withdraw
  const handleTx = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/goals/tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txForm)
      });
      setTxForm({ type: 'Deposit', goal: '', amount: '', paydate: '', description: '' });
      fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setGoals);
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  // Edit Transaction
  const handleEditTxSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/goals/tx/${editTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTxForm)
      });
      setEditTx(null);
      setEditTxForm({});
      fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setGoals);
    } catch (err) {
      setError('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  // Delete Transaction
  const handleDeleteTx = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/goals/tx/${tx.id}`, { method: 'DELETE' });
      fetch(`/api/goals-table${search ? `?q=${encodeURIComponent(search)}` : ''}`)
        .then(res => res.json())
        .then(setGoals);
    } catch (err) {
      setError('Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Goals
        </Typography>
        <Paper sx={{ p: 2, mb: 4, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, background: '#fff', maxWidth: 420, border: '1px solid #e3e7ed', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField label="Search" variant="outlined" size="small" value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 250 }} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddGoalOpen(true)} sx={{ ml: 'auto', background: '#5b47fb', '&:hover': { background: '#4a3ecb' } }}>Add Goal</Button>
        </Paper>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {/* Add/Edit Goal Dialogs */}
        <Dialog open={addGoalOpen} onClose={() => setAddGoalOpen(false)}>
          <DialogTitle>Add Goal</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleAddGoal} sx={{ mt: 1, minWidth: 350 }}>
              <TextField id="add-goal-name" name="name" label="Name" value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
              <TextField id="add-goal-description" name="description" label="Description" value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="add-goal-category" name="category" label="Category" value={goalForm.category} onChange={e => setGoalForm(f => ({ ...f, category: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="add-goal-balance" name="CurrentBalance" label="Balance" type="number" value={goalForm.CurrentBalance || ''} onChange={e => setGoalForm(f => ({ ...f, CurrentBalance: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="add-goal-interest" name="InterestRate" label="Interest Rate (%)" type="number" value={goalForm.InterestRate || ''} onChange={e => setGoalForm(f => ({ ...f, InterestRate: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="add-goal-monthly" name="EstMonthlyPmt" label="Monthly Payment" type="number" value={goalForm.EstMonthlyPmt || ''} onChange={e => setGoalForm(f => ({ ...f, EstMonthlyPmt: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <DialogActions>
                <Button onClick={() => setAddGoalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Add</Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editGoal} onClose={() => setEditGoal(null)}>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, minWidth: 350 }}>
              <TextField id="edit-goal-name" name="name" label="Name" value={editGoalForm.Name || editGoalForm.name || ''} onChange={e => setEditGoalForm(f => ({ ...f, Name: e.target.value, name: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
              <TextField id="edit-goal-description" name="description" label="Description" value={editGoalForm.Description || editGoalForm.description || ''} onChange={e => setEditGoalForm(f => ({ ...f, Description: e.target.value, description: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="edit-goal-category" name="category" label="Category" value={editGoalForm.Category || editGoalForm.category || ''} onChange={e => setEditGoalForm(f => ({ ...f, Category: e.target.value, category: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="edit-goal-balance" name="CurrentBalance" label="Balance" type="number" value={editGoalForm.CurrentBalance || editGoalForm.Balance || ''} onChange={e => setEditGoalForm(f => ({ ...f, CurrentBalance: e.target.value, Balance: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="edit-goal-interest" name="InterestRate" label="Interest Rate (%)" type="number" value={editGoalForm.InterestRate || ''} onChange={e => setEditGoalForm(f => ({ ...f, InterestRate: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <TextField id="edit-goal-monthly" name="EstMonthlyPmt" label="Monthly Payment" type="number" value={editGoalForm.EstMonthlyPmt || ''} onChange={e => setEditGoalForm(f => ({ ...f, EstMonthlyPmt: e.target.value }))} fullWidth sx={{ mb: 2 }} />
              <DialogActions>
                <Button onClick={() => setEditGoal(null)}>Cancel</Button>
                <Button onClick={handleEditGoalSave} variant="contained">Save</Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
        {/* Deposit/Withdraw Form */}
        <Paper sx={{ p: 2, mb: 3, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, background: '#fff', border: '1px solid #e3e7ed' }}>
          <Box component="form" onSubmit={handleTx} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Select value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value }))} size="small" sx={{ minWidth: 120 }}>
              <MenuItem value="Deposit">Deposit</MenuItem>
              <MenuItem value="Withdraw">Withdraw</MenuItem>
            </Select>
            <TextField select label="Goal" value={txForm.goal} onChange={e => setTxForm(f => ({ ...f, goal: e.target.value }))} size="small" sx={{ minWidth: 160 }} required>
              {goals.map(g => <MenuItem key={g.Name || g.name} value={g.Name || g.name}>{g.Name || g.name}</MenuItem>)}
            </TextField>
            <TextField label="Amount" type="number" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} size="small" required sx={{ minWidth: 120 }} />
            <TextField label="Paydate" type="date" value={txForm.paydate} onChange={e => setTxForm(f => ({ ...f, paydate: e.target.value }))} size="small" required sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
            <TextField label="Description" value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} size="small" sx={{ minWidth: 180 }} />
            <Button type="submit" variant="contained" sx={{ background: '#5b47fb', '&:hover': { background: '#4a3ecb' } }}>{txForm.type}</Button>
          </Box>
        </Paper>
        {/* Goals Cards Layout */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="secondary" /></Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {goals.map((goal, idx) => {
              const { bg, color } = getCategoryColor(goal.Category || goal.category || goal.Name || goal.name);
              return (
                <Grid item xs={12} md={4} key={goal.id || idx} sx={{ display: 'flex', minWidth: 0 }}>
                  <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                    <Box sx={{ background: bg, color, p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                      <Typography variant="h6" fontWeight={700}>{goal.Name || goal.name}</Typography>
                    </Box>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="body2" mb={1}><strong>Name:</strong> {goal.Name || goal.name}</Typography>
                      <Typography variant="body2" mb={1}><strong>Category:</strong> {goal.Category || goal.category}</Typography>
                      <Typography variant="body2" mb={1}><strong>Description:</strong> {goal.Description || goal.description}</Typography>
                      <Typography variant="body2" mb={1}><strong>Balance:</strong> ${Number(goal.CurrentBalance || goal.Balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                      <Typography variant="body2" mb={1}><strong>Interest:</strong> {Number(goal.InterestRate || 0).toFixed(2)}%</Typography>
                      <Typography variant="body2" mb={1}><strong>Monthly Payment:</strong> {Number(goal.EstMonthlyPmt || 0).toFixed(2)}</Typography>
                      <Typography variant="body2" mb={1}><strong>Goal Reached in:</strong> {Number(goal.PayOffTime || 0)} Months or {Number(goal.PayOffTimeYrs || 0)} Years</Typography>
                      <Typography variant="body2" mb={2}><strong>Total Interest:</strong> {Number(goal.totalInterestPaid || 0).toFixed(2)}</Typography>
                      <Box className="mb-2" sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button size="small" variant="outlined" color="primary" onClick={() => {
                          // Normalize all possible field names for edit dialog
                          const normalizedGoal = {
                            ...goal,
                            Name: goal.Name || goal.name || '',
                            Description: goal.Description || goal.description || '',
                            Category: goal.Category || goal.category || '',
                            CurrentBalance: goal.CurrentBalance || goal.Balance || '',
                            InterestRate: goal.InterestRate || '',
                            EstMonthlyPmt: goal.EstMonthlyPmt || '',
                          };
                          setEditGoal(goal);
                          setEditGoalForm(normalizedGoal);
                        }}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" disabled={goal.transactions && goal.transactions.length > 0} onClick={() => handleDeleteGoal(goal)}>Delete</Button>
                      </Box>
                      <Box sx={{ height: 250, width: '100%' }}>
                        <DataGrid
                          rows={(goal.transactions || []).map((row, i) => ({ ...row, id: row.id || i }))}
                          columns={[
                            { field: 'Type', headerName: 'Type', width: 80 },
                            { field: 'Amount', headerName: 'Amount', width: 100, type: 'number' },
                            { field: 'PayDate', headerName: 'Date', width: 110 },
                            { field: 'Description', headerName: 'Description', width: 160 },
                            {
                              field: 'actions',
                              headerName: 'Actions',
                              width: 120,
                              sortable: false,
                              renderCell: (params) => (
                                editTx && editTx.id === params.row.id ? (
                                  <>
                                    <Button color="primary" size="small" onClick={handleEditTxSave}>Save</Button>
                                    <Button color="secondary" size="small" onClick={() => setEditTx(null)}>Cancel</Button>
                                  </>
                                ) : (
                                  <>
                                    <IconButton color="primary" onClick={() => { setEditTx(params.row); setEditTxForm(params.row); }}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteTx(params.row)}><DeleteIcon /></IconButton>
                                  </>
                                )
                              )
                            },
                          ]}
                          pageSize={5}
                          rowsPerPageOptions={[5, 10, 20]}
                          disableSelectionOnClick
                          sx={{ background: '#f9fafb', borderRadius: 2, border: '1px solid #e3e7ed', fontSize: 13, '& .MuiDataGrid-columnHeaders': { background: '#ede7f6', color: '#5b47fb', fontWeight: 700, fontSize: 13 }, '& .MuiDataGrid-row': { background: '#fff' }, '& .MuiDataGrid-footerContainer': { background: '#ede7f6' }, '& .MuiDataGrid-cell': { color: '#222b45' }, '& .purple-header': { color: '#5b47fb' } }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Goals;
