import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, TextField, Paper, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ACCOUNTS = [
  { key: 'spending', label: 'Spending' },
  { key: 'reserve', label: 'Reserve' },
  { key: 'growth', label: 'Growth' },
];

function Forecast() {
  const [forecast, setForecast] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState(null);

  // Fetch default start/end dates on mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/forecast-table/defaults`)
      .then(res => res.json())
      .then(({ defaultStart, defaultEnd }) => {
        // Convert to yyyy-MM-dd if needed
        const toDateString = (d) => {
          if (!d) return '';
          if (typeof d === 'string' && d.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
          // Try to parse ISO string
          const date = new Date(d);
          if (!isNaN(date)) {
            return date.toISOString().slice(0, 10);
          }
          return d;
        };
        setStart(s => s || toDateString(defaultStart));
        setEnd(e => e || toDateString(defaultEnd));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = [];
    if (start) params.push(`start=${start}`);
    if (end) params.push(`end=${end}`);
    if (search) params.push(`q=${encodeURIComponent(search)}`);
    setLoading(true);
    fetch(`/api/forecast-table${params.length ? '?' + params.join('&') : ''}`)
      .then(res => res.json())
      .then(setForecast)
      .catch(() => setError('Failed to load forecast'))
      .finally(() => setLoading(false));
  }, [search, start, end]);

  // Debug: log forecast tables to verify all entries are present
  useEffect(() => {
    if (forecast.tables) {
      console.log('Forecast tables:', forecast.tables);
    }
  }, [forecast]);

  // Combined net forecast summary
  const totalNetAll = forecast.totalNetAll || 0;

  return (
    <Box sx={{ p: 2, width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
        Forecast
      </Typography>
      <Paper sx={{ p: 2, mb: 3, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, background: '#fff', maxWidth: 600, border: '1px solid #e3e7ed', display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField label="Search" variant="outlined" size="small" value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 200 }} />
        <TextField label="Start Date" type="date" size="small" value={start} onChange={e => setStart(e.target.value)} sx={{ width: 160 }} InputLabelProps={{ shrink: true }} />
        <TextField label="End Date" type="date" size="small" value={end} onChange={e => setEnd(e.target.value)} sx={{ width: 160 }} InputLabelProps={{ shrink: true }} />
      </Paper>
      {/* Combined Net Forecast Summary */}
      <Box sx={{ mb: 3 }}>
        <Alert severity={totalNetAll < 0 ? 'error' : 'success'} icon={false} sx={{ fontSize: 18, fontWeight: 600, bgcolor: totalNetAll < 0 ? '#ffeaea' : '#ede7f6', color: totalNetAll < 0 ? '#b71c1c' : '#5b47fb', border: '1px solid #e3e7ed', borderRadius: 2 }}>
          🧣 Combined Net Forecast: ${totalNetAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Alert>
      </Box>
      {/* Forecast tables in left-to-right order: Spending | Reserve | Growth */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="secondary" /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container columns={12} columnSpacing={3} alignItems="stretch">
          {ACCOUNTS.map(({ key, label }) => (
            <Grid gridColumn={{ xs: 'span 12', md: 'span 4' }} key={key} display="flex" sx={{ flex: 1, minWidth: 0 }}>
              <Card elevation={3} sx={{ height: '100%', width: '100%', borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>{label} Forecast</Typography>
                  {/* Account summary bar */}
                  <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: key === 'spending' ? '#ede7f6' : key === 'reserve' ? '#e1d7fa' : '#f3e8fd' }}>
                    <Typography variant="body2"><b>Start Balance:</b> ${parseFloat(forecast.nets?.[key]?.start_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                    <Typography variant="body2"><b>Deposits:</b> ${parseFloat(forecast.nets?.[key]?.deposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                    <Typography variant="body2"><b>Withdrawals:</b> ${parseFloat(forecast.nets?.[key]?.withdrawals || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                    <Typography variant="body2" sx={{ color: (forecast.nets?.[key]?.net || 0) < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}><b>Net:</b> ${parseFloat(forecast.nets?.[key]?.net || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <DataGrid
                      rows={(forecast.tables?.[key] || []).map((row, i) => ({ id: i, ...row }))}
                      columns={[
                        { field: 'Date', headerName: 'Date', width: 100 },
                        { field: 'Description', headerName: 'Description', width: 180 },
                        { field: 'Withdrawals', headerName: 'Withdrawals', width: 110, type: 'number' },
                        { field: 'Deposits', headerName: 'Deposits', width: 110, type: 'number' },
                        { field: 'Balance', headerName: 'Balance', width: 110, type: 'number' },
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
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Forecast;
