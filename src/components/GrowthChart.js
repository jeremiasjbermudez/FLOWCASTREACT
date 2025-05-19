import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import DateRangePicker from './DateRangePicker';

async function fetchGrowthChartData(start, end) {
  const res = await fetch(`/api/growth-chart?start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

function GrowthChart() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [start, setStart] = useState(firstDayOfMonth);
  const [end, setEnd] = useState(lastDayOfMonth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (start && end) {
      setError(null);
      setLoading(true);
      fetchGrowthChartData(start, end)
        .then((fetchedData) => {
          setData(fetchedData);
        })
        .catch((err) => {
          setError("Failed to load data.");
          setData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [start, end]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Growth Chart</Typography>
        <DateRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} />
        <Box sx={{ width: "100%", height: 400 }}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="balance" stroke="#8884d8" fillOpacity={1} fill="url(#colorBalance)" />
                <Area type="monotone" dataKey="withdrawals" stroke="#82ca9d" fillOpacity={1} fill="url(#colorWithdrawals)" />
                <Area type="monotone" dataKey="deposits" stroke="#ffc658" fillOpacity={1} fill="url(#colorDeposits)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default GrowthChart;
