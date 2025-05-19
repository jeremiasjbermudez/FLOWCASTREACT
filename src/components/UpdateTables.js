import React, { useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Alert, Grid, Card, CardContent } from '@mui/material';

function UpdateTables() {
  const [files, setFiles] = useState({ spending: null, reserve: null, growth: null });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState({});
  const [error, setError] = useState({});

  const handleFileChange = (e, key) => {
    setFiles(f => ({ ...f, [key]: e.target.files[0] }));
    setSuccess({});
    setError({});
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccess({});
    setError({});
    const formData = new FormData();
    let hasFile = false;
    for (const key of ['spending', 'reserve', 'growth']) {
      if (files[key]) {
        formData.append(key, files[key]);
        hasFile = true;
      }
    }
    if (!hasFile) {
      setError({ general: 'Please select at least one file.' });
      setUploading(false);
      return;
    }
    try {
      const res = await fetch('/api/update-tables', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess({ general: data.message || 'Upload successful!' });
        setError({});
      } else {
        setError({ general: data.error || 'Upload failed.' });
        setSuccess({});
      }
    } catch (err) {
      setError({ general: 'Upload failed.' });
      setSuccess({});
    }
    setUploading(false);
    setFiles({ spending: null, reserve: null, growth: null });
  };

  return (
    <Box sx={{ background: '#f4f6fb', minHeight: '100vh', py: 4, px: { xs: 1, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#5b47fb', mb: 3, letterSpacing: 0.5, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
          Update Tables
        </Typography>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0 }}>
            <Card sx={{ flex: 1, minWidth: 0, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(91,71,251,0.07)', background: '#fff', height: '100%', border: '1px solid #e3e7ed', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(91,71,251,0.13)' } }}>
              <CardContent sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#5b47fb', mb: 2, letterSpacing: 0.2, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
                  Update Data
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
                    <form onSubmit={handleUpload}>
                      {success.general && <Alert severity="success" sx={{ mb: 2 }}>{success.general}</Alert>}
                      {error.general && <Alert severity="error" sx={{ mb: 2 }}>{error.general}</Alert>}
                      {['spending', 'reserve', 'growth'].map(key => (
                        <Box key={key} sx={{ mb: 2 }}>
                          <Typography fontWeight={600} sx={{ mb: 1 }}>{key.charAt(0).toUpperCase() + key.slice(1)} CSV</Typography>
                          <input type="file" accept=".csv" onChange={e => handleFileChange(e, key)} />
                        </Box>
                      ))}
                      <Button type="submit" variant="contained" color="primary" disabled={uploading || !Object.values(files).some(Boolean)} sx={{ minWidth: 160 }}>
                        {uploading ? <CircularProgress size={24} /> : 'Import All'}
                      </Button>
                    </form>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default UpdateTables;
