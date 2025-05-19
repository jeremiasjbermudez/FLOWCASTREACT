import React from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import FlowcastLogo from '../assets/Flowcast.png';

const pages = [
  { label: "Dashboard", path: "/" },
  { label: "Bills", path: "/bills" },
  { label: "Expenses", path: "/expenses" },
  { label: "Deposits", path: "/deposits" },
  { label: "Goals", path: "/goals" },
  { label: "Forecast", path: "/forecast" },
  { label: "Bills Paid", path: "/bills-paid" },
  { label: "Calendar", path: "/calendar" },
  { label: "To Do", path: "/todo" },
  { label: "Habits", path: "/habits" },
  { label: "Update Tables", path: "/update-tables" },
  { label: "Reports", path: "/reports" },
];

const StyledButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: active ? 700 : 400,
  borderBottom: active ? `2px solid ${theme.palette.primary.main}` : 'none',
  borderRadius: 0,
  background: 'none',
  textTransform: 'none',
  marginRight: theme.spacing(1),
}));

function Navigation() {
  const location = useLocation();
  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{ mb: 3 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img src={FlowcastLogo} alt="Flowcast Logo" style={{ height: 44, marginRight: 12 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {pages.map(page => (
            <StyledButton
              key={page.path}
              component={Link}
              to={page.path}
              active={location.pathname === page.path ? 1 : 0}
            >
              {page.label}
            </StyledButton>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
