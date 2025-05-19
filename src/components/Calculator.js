import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function Calculator() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState(null);

  const handleAddition = () => {
    setResult(parseFloat(num1) + parseFloat(num2));
  };

  const handleSubtraction = () => {
    setResult(parseFloat(num1) - parseFloat(num2));
  };

  const handleMultiplication = () => {
    setResult(parseFloat(num1) * parseFloat(num2));
  };

  const handleDivision = () => {
    if (parseFloat(num2) === 0) {
      setResult('Error: Division by zero');
    } else {
      setResult(parseFloat(num1) / parseFloat(num2));
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Calculator
      </Typography>
      <TextField
        label="Number 1"
        variant="outlined"
        fullWidth
        value={num1}
        onChange={(e) => setNum1(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Number 2"
        variant="outlined"
        fullWidth
        value={num2}
        onChange={(e) => setNum2(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" onClick={handleAddition}>
          Add
        </Button>
        <Button variant="contained" onClick={handleSubtraction}>
          Subtract
        </Button>
        <Button variant="contained" onClick={handleMultiplication}>
          Multiply
        </Button>
        <Button variant="contained" onClick={handleDivision}>
          Divide
        </Button>
      </Box>
      {result !== null && (
        <Typography variant="h6" gutterBottom>
          Result: {result}
        </Typography>
      )}
    </Box>
  );
}

export default Calculator;
