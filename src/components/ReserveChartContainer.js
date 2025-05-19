import React, { useState } from "react";
import ReserveChart from "./ReserveChart";
import DateRangePicker from "./DateRangePicker";

export default function ReserveChartContainer() {
  // Set default start and end dates to the first and last day of the current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [start, setStart] = useState(firstDayOfMonth);
  const [end, setEnd] = useState(lastDayOfMonth);

  return (
    <div>
      <DateRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} />
      <ReserveChart
        title="Reserve Chart"
        dataKey="balance"
        gradientId="balanceGradient"
        strokeColor="#6a1b9a"
        fillColor="#9c27b0"
      />
    </div>
  );
}
