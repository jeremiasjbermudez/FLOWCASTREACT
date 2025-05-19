import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ACCOUNTS = [
  { key: "spending", label: "Spending" },
  { key: "reserve", label: "Reserve" },
  { key: "growth", label: "Growth" },
];

function getDefaultStartEnd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { start, end };
}

function BillsPaid() {
  const { start: defaultStart, end: defaultEnd } = getDefaultStartEnd();
  const [bills, setBills] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [populateLoading, setPopulateLoading] = useState(false);
  const [populateMsg, setPopulateMsg] = useState("");

  useEffect(() => {
    const params = [];
    if (start) params.push(`start=${start}`);
    if (end) params.push(`end=${end}`);
    if (search) params.push(`q=${encodeURIComponent(search)}`);
    setLoading(true);
    fetch(`/api/bills-paid${params.length ? '?' + params.join('&') : ''}`)
      .then((res) => res.json())
      .then((data) => {
        setBills(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bills paid");
        setLoading(false);
      });
  }, [search, start, end]);

  const handlePopulate = async () => {
    setPopulateLoading(true);
    setPopulateMsg("");
    try {
      const res = await fetch('/api/bills-paid/populate', { method: 'POST' });
      const text = await res.text();
      setPopulateMsg(text || 'Bills Paid populated.');
      // Refresh
      const params = [];
      if (start) params.push(`start=${start}`);
      if (end) params.push(`end=${end}`);
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      fetch(`/api/bills-paid${params.length ? '?' + params.join('&') : ''}`)
        .then((res) => res.json())
        .then((data) => setBills(data));
    } catch (err) {
      setPopulateMsg('Failed to populate bills paid');
    } finally {
      setPopulateLoading(false);
    }
  };

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Bills Paid
        </Typography>
        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', border: '1px solid #e3e7ed' }}>
          <TextField label="Search" variant="outlined" size="small" value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 200 }} />
          <TextField label="Start Date" type="date" size="small" value={start} onChange={e => setStart(e.target.value)} sx={{ width: 160 }} InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" type="date" size="small" value={end} onChange={e => setEnd(e.target.value)} sx={{ width: 160 }} InputLabelProps={{ shrink: true }} />
          <Button
            variant="contained"
            sx={{ background: '#5b47fb', '&:hover': { background: '#4a3ecb' }, ml: 'auto' }}
            onClick={handlePopulate}
            disabled={populateLoading}
          >
            Populate Bills Paid
          </Button>
        </Paper>
        {populateMsg && <Typography color="info.main" mb={2}>{populateMsg}</Typography>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {ACCOUNTS.map(({ key, label }) => {
              const total = (bills[key] || []).reduce((sum, row) => sum + (parseFloat(row.Amount) || 0), 0);
              return (
                <Grid item xs={12} md={4} key={key} sx={{ display: 'flex', minWidth: 0 }}>
                  <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                    <CardContent sx={{ p: 2, pb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                        {label} Bills Paid
                      </Typography>
                      <Box sx={{ height: 220, width: '100%' }}>
                        <DataGrid
                          rows={(bills[key] || []).map((row, i) => ({ id: i, ...row }))}
                          columns={[
                            { field: 'Description', headerName: 'Description', width: 180 },
                            { field: 'Amount', headerName: 'Amount', width: 110, type: 'number' },
                            { field: 'Date', headerName: 'Date', width: 110 },
                            { field: 'Account', headerName: 'Account', width: 100 },
                          ]}
                          pageSize={3}
                          rowsPerPageOptions={[3]}
                          disableSelectionOnClick
                          sx={{ background: '#f9fafb', borderRadius: 2, border: '1px solid #e3e7ed', fontSize: 13, '& .MuiDataGrid-columnHeaders': { background: '#ede7f6', color: '#5b47fb', fontWeight: 700, fontSize: 13 }, '& .MuiDataGrid-row': { background: '#fff' }, '& .MuiDataGrid-footerContainer': { background: '#ede7f6' }, '& .MuiDataGrid-cell': { color: '#222b45' } }}
                        />
                      </Box>
                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
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

export default BillsPaid;
