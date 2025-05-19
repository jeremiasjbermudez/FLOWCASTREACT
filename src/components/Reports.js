import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, TextField, Button, Card, CardContent, Paper } from "@mui/material";
import { Doughnut, Bar } from "react-chartjs-2";
import ReserveChart from './ReserveChart';
import SpendingChart from './SpendingChart';
import GrowthChart from './GrowthChart';
import DateRangePicker from './DateRangePicker';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement);
ChartJS.register(CategoryScale);
ChartJS.register(LinearScale);
ChartJS.register(BarElement);

function Reports() {
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalData, setGoalData] = useState(null);
  const [goalCharts, setGoalCharts] = useState([]);
  const [topHabits, setTopHabits] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSavedCharts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/goals-table/charts');
        if (response.ok) {
          const savedCharts = await response.json();

          // Log the response to debug missing fields
          console.log('API Response:', savedCharts);

          const formattedCharts = savedCharts.map(chart => ({
            id: chart.id, // Include the id field
            name: chart.name,
            goalAmount: parseFloat(chart.goalAmount),
            balance: parseFloat(chart.balance),
            progress: parseFloat(chart.goalAmount) - parseFloat(chart.balance),
            payoffTime: chart.payoffTime, // Ensure these fields are mapped
            payoffTimeYrs: chart.payoffTimeYrs,
            category: chart.category, // Added category field
          }));
          console.log('Formatted charts:', formattedCharts);

          setGoalCharts(formattedCharts);
        } else {
          console.error('Failed to fetch saved charts');
        }
      } catch (error) {
        console.error('Error fetching saved charts:', error);
      }
    };

    fetchSavedCharts();
  }, []);

  useEffect(() => {
    const fetchTopHabits = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('start', startDate);
        if (endDate) queryParams.append('end', endDate);

        const response = await fetch(`http://localhost:4000/api/habits/top-expensive?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setTopHabits(data);
        } else {
          console.error('Failed to fetch top habits');
        }
      } catch (error) {
        console.error('Error fetching top habits:', error);
      }
    };

    fetchTopHabits();
  }, [startDate, endDate]);

  const handleFetchGoalData = async () => {
    if (!goalName || !goalAmount) return;

    try {
      const response = await fetch(`http://localhost:4000/api/goals-table?q=${encodeURIComponent(goalName)}`);
      const data = await response.json();
      const goal = data.find((g) => g.Name === goalName);

      if (goal) {
        const balance = parseFloat(goal.CurrentBalance || 0);
        const progress = parseFloat(goalAmount) - balance;
        setGoalData({
          name: goalName,
          goalAmount: parseFloat(goalAmount),
          balance,
          progress,
        });
      }
    } catch (error) {
      console.error("Failed to fetch goal data:", error);
    }
  };

  const handleAddGoalChart = async () => {
    if (!goalName || !goalAmount) return;

    try {
      const response = await fetch('http://localhost:4000/api/goals-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: goalName,
          custom4: parseFloat(goalAmount),
        }),
      });

      if (response.ok) {
        const balance = 0; // Assuming balance starts at 0
        const progress = parseFloat(goalAmount) - balance;
        const newGoal = {
          name: goalName,
          goalAmount: parseFloat(goalAmount),
          balance,
          progress,
        };
        setGoalCharts((prevCharts) => [...prevCharts, newGoal]);
      } else {
        console.error('Failed to add goal chart');
      }
    } catch (error) {
      console.error('Error adding goal chart:', error);
    }
  };

  const handleDeleteGoal = async (goalName) => {
    try {
      const response = await fetch(`http://localhost:4000/api/goals-table/${encodeURIComponent(goalName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGoalCharts((prevCharts) => prevCharts.filter((goal) => goal.name !== goalName));
      } else {
        console.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Reports
        </Typography>

        {/* Goals Form Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
            Goals Form
          </Typography>
          <Paper sx={{ p: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, background: '#fff', maxWidth: 420, border: '1px solid #e3e7ed', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <TextField label="Goal Name" variant="outlined" size="small" value={goalName} onChange={e => setGoalName(e.target.value)} sx={{ width: '100%' }} />
            <TextField label="Goal Amount" type="number" variant="outlined" size="small" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} sx={{ width: '100%' }} />
            <Button variant="contained" onClick={handleAddGoalChart} sx={{ background: '#5b47fb', '&:hover': { background: '#4a3ecb' } }}>Add Goal</Button>
          </Paper>
        </Box>

        {/* Goals Graphs Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
            Goals Graphs
          </Typography>
          <Grid container spacing={2}>
            {goalCharts.filter(goal => goal.Custom4 !== null).map((goal, index) => (
              <Box key={index} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                <Card sx={{ boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', borderRadius: 2, border: '1px solid #e3e7ed', background: '#fff' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {goal.name}
                    </Typography>
                    <Doughnut
                      data={{
                        labels: ["Progress", "Remaining"],
                        datasets: [
                          {
                            data: [goal.progress, goal.goalAmount - goal.progress],
                            backgroundColor: goal.category === "spending" ? ["#9c27b0", "#e1bee7"] : goal.category === "reserve" ? ["#7b1fa2", "#d1c4e9"] : ["#4a148c", "#b39ddb"],
                            borderColor: goal.category === "spending" ? "#6a1b9a" : goal.category === "reserve" ? "#512da8" : "#311b92",
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: "bottom",
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const label = context.label || "";
                                const value = context.raw || 0;
                                return `${label}: $${value.toLocaleString()}`;
                              },
                            },
                          },
                        },
                      }}
                      style={{ width: '200px', height: '200px', margin: '0 auto', display: 'block' }}
                    />
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                      Goal reached in: {goal.payoffTime} months or {goal.payoffTimeYrs} Years
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                      ({goal.progress} out of {goal.goalAmount} paid)
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteGoal(goal.name)}
                      sx={{ mt: 2 }}
                    >
                      Delete Goal
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Top 10 Most Expensive Habits Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
            Top 10 Most Expensive Habits
          </Typography>
          <DateRangePicker
            start={startDate}
            end={endDate}
            setStart={setStartDate}
            setEnd={setEndDate}
          />
          <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 4 }}>
            <Bar
              data={{
                labels: topHabits.map(habit => habit.name),
                datasets: [
                  {
                    label: 'Total Expense',
                    data: topHabits.map(habit => habit.total),
                    backgroundColor: 'rgba(91, 71, 251, 0.7)',
                    borderColor: 'rgba(91, 71, 251, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `$${context.raw.toLocaleString()}`;
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Spending, Reserve, and Growth Charts Section */}
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
            Spending, Reserve, and Growth Charts
          </Typography>
          <Grid container spacing={3} alignItems="stretch">
            <Grid sx={{ display: 'flex', flexGrow: 1, gridColumn: 'span 4' }}>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', border: '1px solid #e3e7ed' }}>
                <SpendingChart />
              </Box>
            </Grid>
            <Grid sx={{ display: 'flex', flexGrow: 1, gridColumn: 'span 4' }}>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', border: '1px solid #e3e7ed' }}>
                <ReserveChart />
              </Box>
            </Grid>
            <Grid sx={{ display: 'flex', flexGrow: 1, gridColumn: 'span 4' }}>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', border: '1px solid #e3e7ed' }}>
                <GrowthChart />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default Reports;
