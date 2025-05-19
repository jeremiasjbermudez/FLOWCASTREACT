import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const TABLES = [
  { key: 'spending', label: 'Spending' },
  { key: 'reserve', label: 'Reserve' },
  { key: 'growth', label: 'Growth' },
];

function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [start, setStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  });

  useEffect(() => {
    setLoading(true);
    let url = `${process.env.REACT_APP_API_BASE_URL || ''}/api/accounts-data?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (start) url += `start=${start}&`;
    if (end) url += `end=${end}`;
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, [search, start, end]);

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Dashboard
        </Typography>
        <Paper sx={{ p: 2, mb: 4, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, background: '#fff', maxWidth: 700, border: '1px solid #e3e7ed', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 200 }}
          />
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={start}
            onChange={e => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={end}
            onChange={e => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
        </Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="secondary" /></Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {TABLES.map(({ key, label }) => (
              <Grid item xs={12} md={4} key={key} sx={{ display: 'flex', minWidth: 0 }}>
                <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                  <CardContent sx={{ p: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                        {label}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#5b47fb', fontWeight: 600, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                        Total: ${data[label]?.totals?.TotalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 220, width: '100%' }}>
                      <DataGrid
                        rows={(data[label]?.rows || []).map((row, i) => ({ id: i, ...row }))}
                        columns={[
                          { field: 'Date', headerName: 'Date', width: 90, headerClassName: 'purple-header' },
                          { field: 'Description', headerName: 'Description', width: 120, headerClassName: 'purple-header' },
                          { field: 'Withdrawals', headerName: 'Withdrawals', width: 80, type: 'number', headerClassName: 'purple-header' },
                          { field: 'Deposits', headerName: 'Deposits', width: 80, type: 'number', headerClassName: 'purple-header' },
                          { field: 'Balance', headerName: 'Balance', width: 80, type: 'number', headerClassName: 'purple-header' },
                        ]}
                        pageSize={3}
                        rowsPerPageOptions={[3]}
                        disableSelectionOnClick
                        sx={{ background: '#f9fafb', borderRadius: 2, border: '1px solid #e3e7ed', fontSize: 13, '& .MuiDataGrid-columnHeaders': { background: '#ede7f6', color: '#5b47fb', fontWeight: 700, fontSize: 13 }, '& .MuiDataGrid-row': { background: '#fff' }, '& .MuiDataGrid-footerContainer': { background: '#ede7f6' }, '& .MuiDataGrid-cell': { color: '#222b45' }, '& .purple-header': { color: '#5b47fb' } }}
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

export default Dashboard;
