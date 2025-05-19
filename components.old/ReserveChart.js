import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Grid, TextField, Paper } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Dummy fetch function, replace with your real API endpoint
async function fetchReserveData(start, end) {
  // Example: `/api/reserve-balance?start=YYYY-MM-DD&end=YYYY-MM-DD`
  const res = await fetch(`/api/reserve-balance?start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function ReserveChart() {
  // Get the first and last day of the current month
  function getMonthRange() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: first.toISOString().slice(0, 10),
      end: last.toISOString().slice(0, 10)
    };
  }

  const monthRange = getMonthRange();
  const [start, setStart] = useState(monthRange.start);
  const [end, setEnd] = useState(monthRange.end);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (start && end) {
      setError(null); // Clear previous error
      setLoading(true);
      fetchReserveData(start, end)
        .then(setData)
        .catch((err) => {
          setError("No data found for the selected date range.");
          setData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [start, end]);

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#f7f3ff', border: '1px solid #e3e7ed', p: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#5b47fb', fontWeight: 700, mb: 1 }}>
          Reserve & Withdraws Per Day
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid sx={{ mr: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={start}
              onChange={e => setStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid>
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={end}
              onChange={e => setEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Box sx={{ width: '100%', height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => {
                if (name === 'balance') return [`$${value}`, 'Lowest Balance'];
                if (name === 'deposits') return [`$${value}`, 'Total Deposits'];
                if (name === 'withdrawals') return [`$${value}`, 'Total Withdrawals'];
                return value;
              }} />
              <Line type="monotone" dataKey="balance" stroke="#5b47fb" strokeWidth={3} dot={false} name="Lowest Balance" />
              <Line type="monotone" dataKey="deposits" stroke="#7c4dff" strokeWidth={2} dot={false} name="Total Deposits" />
              <Line type="monotone" dataKey="withdrawals" stroke="#d500f9" strokeWidth={2} dot={false} name="Total Withdrawals" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        {loading && <Typography sx={{ mt: 2 }}>Loading...</Typography>}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {!loading && !error && data.length === 0 && (
          <Typography sx={{ mt: 2 }} color="text.secondary">No data available for this range.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
