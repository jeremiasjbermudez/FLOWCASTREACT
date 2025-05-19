import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DateRangePicker from "./DateRangePicker";

async function fetchReserveChartData(start, end) {
  const res = await fetch(`/api/reserve-chart?start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function ReserveChart() {
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
      fetchReserveChartData(start, end)
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
        <Typography variant="h6">Reserve Chart</Typography>
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
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9c27b0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depositsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a148c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4a148c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="withdrawalsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#311b92" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#311b92" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  tick={{ fontSize: 12, fill: "#555" }} 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                />
                <YAxis tick={{ fontSize: 12, fill: "#555" }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#f5f5f5", border: "1px solid #ccc", borderRadius: "5px" }}
                  labelStyle={{ fontWeight: "bold" }}
                  formatter={(value, name) => [`$${value}`, name]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6a1b9a"
                  fill="url(#balanceGradient)"
                  fillOpacity={1}
                  name="Balance"
                />
                <Area
                  type="monotone"
                  dataKey="deposits"
                  stroke="#4a148c" // Darker purple for deposits line
                  fill="url(#depositsGradient)"
                  fillOpacity={1}
                  name="Deposits"
                />
                <Area
                  type="monotone"
                  dataKey="withdrawals"
                  stroke="#311b92" // Deepest purple for withdrawals line
                  fill="url(#withdrawalsGradient)"
                  fillOpacity={1}
                  name="Withdrawals"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
