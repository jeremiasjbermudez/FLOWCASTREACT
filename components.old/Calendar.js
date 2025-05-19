import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Paper } from '@mui/material';

function getMonthInfo(offset = 0) {
  const today = new Date();
  today.setMonth(today.getMonth() + offset);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  return { year, month, monthName };
}

function buildCalendar(year, month, bills, billsPaid) {
  bills = bills || [];
  billsPaid = billsPaid || [];
  const firstDay = new Date(`${year}-${month}-01`);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDay = firstDay.getDay(); // 0=Sunday
  const rows = [];
  let cells = [];
  for (let i = 0; i < startDay; i++) cells.push(<td key={`empty-start-${i}`}></td>);
  for (let day = 1; day <= daysInMonth; day++) {
    const billList = bills.filter(b => new Date(b.DayOfMonth).getDate() === day);
    const paidList = billsPaid.filter(p => new Date(p.Date).getDate() === day);
    cells.push(
      <td key={day} style={{ verticalAlign: 'top', minWidth: 90 }}>
        <strong>{day}</strong>
        {billList.map((bill, i) => (
          <Box key={i} sx={{ bgcolor: '#c7b6f7', color: 'primary.main', border: 1, borderColor: 'info.main', borderRadius: 1, p: 0.5, mt: 0.5 }}>
            <Typography variant="caption">{bill.Bill}<br /><strong>${bill.Amount}</strong></Typography>
          </Box>
        ))}
        {paidList.map((paid, i) => (
          <Box key={i} sx={{ bgcolor: '#b39ddb', color: 'success.main', border: 1, borderColor: 'success.main', borderRadius: 1, p: 0.5, mt: 0.5 }}>
            <Typography variant="caption">{paid.Description}<br /><strong>${paid.Amount}</strong></Typography>
          </Box>
        ))}
      </td>
    );
    if ((cells.length) % 7 === 0) {
      rows.push(<tr key={`row-${day}`}>{cells}</tr>);
      cells = [];
    }
  }
  if (cells.length) {
    while (cells.length < 7) cells.push(<td key={`empty-end-${cells.length}`}></td>);
    rows.push(<tr key="row-last">{cells}</tr>);
  }
  return rows;
}

function Calendar() {
  const [data, setData] = useState({ current: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMonth(offset, key) {
      const { year, month } = getMonthInfo(offset);
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      if (!res.ok) throw new Error('Failed to fetch calendar');
      const json = await res.json();
      return { key, ...json, year, month };
    }
    setLoading(true);
    Promise.all([
      fetchMonth(0, 'current'),
      fetchMonth(1, 'next')
    ]).then(([current, next]) => {
      setData({ current, next });
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Calendar
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {[data.current, data.next].map((monthData, idx) => monthData && (
              <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0 }} key={monthData.key}>
                <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
                  <CardContent sx={{ p: 2, pb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                      {getMonthInfo(idx).monthName}
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                      <Paper sx={{ overflowX: 'auto' }}>
                        <table className="table table-bordered" style={{ minWidth: 650 }}>
                          <thead>
                            <tr>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <th className="text-center" key={d}>{d}</th>)}</tr>
                          </thead>
                          <tbody>
                            {buildCalendar(monthData.year, monthData.month, monthData.bills, monthData.billsPaid)}
                          </tbody>
                        </table>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Box className="legend mt-4" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 18, height: 18, bgcolor: '#c7b6f7', borderRadius: 1, mr: 1 }} />
            <Typography variant="body2">Scheduled Bill</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 18, height: 18, bgcolor: '#b39ddb', borderRadius: 1, mr: 1 }} />
            <Typography variant="body2">Paid Bill</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Calendar;
