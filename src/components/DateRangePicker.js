import React from "react";
import { Grid, TextField } from "@mui/material";

export default function DateRangePicker({ start, end, setStart, setEnd }) {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid>
        <TextField
          label="Start Date"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid>
        <TextField
          label="End Date"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
}
