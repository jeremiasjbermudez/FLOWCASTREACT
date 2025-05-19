<?php
// forecast.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// DB connection
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Find closest "5737 PAYROLL" date before today
$defaultStart = '';
$res = $conn->query("SELECT Date FROM reserve WHERE Description LIKE '%5737 PAYROLL%' AND Date <= CURDATE() ORDER BY Date DESC LIMIT 1");
if ($res && $row = $res->fetch_assoc()) {
    $defaultStart = $row['Date'];
}

// Default end date
$today = (int)date('d');
$defaultEnd = ($today >= 16) ? date('Y-m-30') : date('Y-m-15');

// Get initial filter values
$start = isset($_GET['start']) ? $_GET['start'] : $defaultStart;
$end   = isset($_GET['end'])   ? $_GET['end']   : $defaultEnd;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Forecast Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background-color: #f0f4f8;
      padding: 20px;
      font-family: 'Segoe UI', sans-serif;
    }
    .header {
      background: linear-gradient(90deg, #2c3e50, #34495e);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .header h4 { margin: 0; font-size: 2rem; }
    .table-wrapper {
      background: white;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow-x: auto;
    }
    @media print {
      .header, .btn, .text-end, #forecastSearch, input[type="date"] { display: none !important; }
      .table-wrapper { box-shadow: none; border: none; }
      .table { font-size: 12px; }
    }
  </style>
</head>
<body>

<div class="header d-flex justify-content-between align-items-center">
  <h4>🧙‍♂️ Forecast Dashboard</h4>
  <div class="d-flex flex-wrap align-items-center gap-2">
    <button onclick="window.print()" class="btn btn-outline-warning text-dark">🖸️ Print</button>
    <a href="calendar.php" class="btn btn-outline-info btn-sm">📅 Calendar</a>
    <a href="update_tables.php" class="btn btn-outline-info btn-sm">🔮 Update Accounts</a>
    <a href="bills.php" class="btn btn-outline-info btn-sm">💸 Bills</a>
    <a href="expenses.php" class="btn btn-outline-info btn-sm">💸 Expenses</a>
    <a href="deposits.php" class="btn btn-outline-info btn-sm">💰 Deposits</a>
    <a href="bills_paid.php" class="btn btn-outline-info btn-sm">📄 Bills Paid</a>
    <a href="forecast.php" class="btn btn-outline-info btn-sm">🔮 Forecast</a>
    <a href="goals.php" class="btn btn-outline-info btn-sm">⚽ Goals</a>
    <a href="todo.php" class="btn btn-outline-info btn-sm">📝 To Do</a>
    <a href="habits.php" class="btn btn-sm btn-outline-light border border-info">🧲 Habits</a>
    <a href="index.php" class="btn btn-outline-info btn-sm">🏠 Back to Dashboard</a>
    <input type="text" id="forecastSearch" class="form-control ms-2" placeholder="Search Forecast...">
  </div>
</div>

<div class="mb-3">
  <h5 class="mb-2">Forecasted budget by date range:</h5>
  <div class="controls d-flex gap-2">
    <input type="date" id="startDate" class="form-control" value="<?php echo htmlspecialchars($start); ?>">
    <input type="date" id="endDate" class="form-control" value="<?php echo htmlspecialchars($end); ?>">
  </div>
</div>

<div id="forecastContainer">
  <?php
    $_GET['start'] = $start;
    $_GET['end'] = $end;
    include __DIR__ . '/fetch_forecast.php';
  ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const startInput = document.getElementById('startDate');
  const endInput = document.getElementById('endDate');
  const searchInput = document.getElementById('forecastSearch');

  function updateForecast() {
    const start = startInput.value;
    const end = endInput.value;
    const q = searchInput.value;

    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (q) params.append('q', q);

    fetch(`fetch_forecast.php?${params}`)
      .then(res => res.text())
      .then(html => {
        document.getElementById('forecastContainer').innerHTML = html;
      });
  }

  startInput.addEventListener('change', updateForecast);
  endInput.addEventListener('change', updateForecast);
  searchInput.addEventListener('input', updateForecast);

  updateForecast();
});
</script>

</body>
</html>