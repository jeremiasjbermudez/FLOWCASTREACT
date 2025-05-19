import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import ReserveChart from './ReserveChart';

function Reports() {
  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Reports
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          <Grid sx={{ display: 'flex', minWidth: 0, flexBasis: 0, flexGrow: 1, maxWidth: '100%' }}>
            <ReserveChart />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Reports;
