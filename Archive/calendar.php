<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Fetch Bills
function fetchBillsByMonth($conn, $year, $month) {
    $start = "$year-$month-01";
    $end = date("Y-m-t", strtotime($start));
    $stmt = $conn->prepare("SELECT * FROM Bills WHERE DayOfMonth BETWEEN ? AND ?");
    $stmt->bind_param("ss", $start, $end);
    $stmt->execute();
    $result = $stmt->get_result();

    $bills = [];
    while ($row = $result->fetch_assoc()) {
        $day = date("j", strtotime($row['DayOfMonth']));
        $bills[$day][] = $row;
    }
    return $bills;
}

// Fetch BillsPaid
function fetchBillsPaidByMonth($conn, $year, $month) {
    $start = "$year-$month-01";
    $end = date("Y-m-t", strtotime($start));
    $stmt = $conn->prepare("SELECT * FROM BillsPaid WHERE Date BETWEEN ? AND ?");
    $stmt->bind_param("ss", $start, $end);
    $stmt->execute();
    $result = $stmt->get_result();

    $paid = [];
    while ($row = $result->fetch_assoc()) {
        $day = date("j", strtotime($row['Date']));
        $paid[$day][] = $row;
    }
    return $paid;
}

// Calendar Drawing
function drawCalendar($year, $month, $bills, $billsPaid) {
    $monthName = date("F Y", strtotime("$year-$month-01"));
    $daysInMonth = date("t", strtotime("$year-$month-01"));
    $startDay = date("w", strtotime("$year-$month-01")); // 0=Sunday

    echo "<div class='calendar'>";
    echo "<h4 class='text-center'>$monthName</h4>";
    echo "<table class='table table-bordered'><thead><tr>";

    foreach (['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as $day) {
        echo "<th class='text-center'>$day</th>";
    }

    echo "</tr></thead><tbody><tr>";

    for ($i = 0; $i < $startDay; $i++) echo "<td></td>";

    for ($day = 1; $day <= $daysInMonth; $day++) {
        if (($startDay + $day - 1) % 7 == 0 && $day != 1) echo "</tr><tr>";
        echo "<td><strong>$day</strong>";

        // Scheduled Bills
        if (!empty($bills[$day])) {
            foreach ($bills[$day] as $bill) {
                echo "<div class='bill bg-info-subtle text-primary border border-info rounded p-1 mt-1'>
                        <small>{$bill['Bill']}<br><strong>\${$bill['Amount']}</strong></small>
                      </div>";
            }
        }

        // Paid Bills
        if (!empty($billsPaid[$day])) {
            foreach ($billsPaid[$day] as $paid) {
                echo "<div class='bill bg-success-subtle text-success border border-success rounded p-1 mt-1'>
                        <small>{$paid['Description']}<br><strong>\${$paid['Amount']}</strong></small>
                      </div>";
            }
        }

        echo "</td>";
    }

    $remaining = (7 - (($startDay + $daysInMonth) % 7)) % 7;
    for ($i = 0; $i < $remaining; $i++) echo "<td></td>";

    echo "</tr></tbody></table></div>";
}

// Current and Next Month Setup
$currentYear  = date('Y');
$currentMonth = date('m');
$nextMonth    = date('m', strtotime('+1 month'));
$nextYear     = date('Y', strtotime('+1 month'));

$billsCurrent     = fetchBillsByMonth($conn, $currentYear, $currentMonth);
$billsPaidCurrent = fetchBillsPaidByMonth($conn, $currentYear, $currentMonth);
$billsNext        = fetchBillsByMonth($conn, $nextYear, $nextMonth);
$billsPaidNext    = fetchBillsPaidByMonth($conn, $nextYear, $nextMonth);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>📅 Calendar – Finance Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: #f0f4f8;
      padding: 20px;
      font-family: 'Segoe UI', sans-serif;
    }
    .header {
      background: linear-gradient(90deg, #2c3e50, #34495e);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .calendar-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .calendar {
      flex: 1;
      min-width: 320px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 0 12px rgba(0,0,0,0.1);
    }
    .legend span {
      padding: 6px 12px;
      margin-right: 10px;
      border-radius: 20px;
    }
  </style>
</head>
<body>
  <div class="header d-flex justify-content-between align-items-center">
    <h4>📅 Calendar</h4>
    <div class="d-flex align-items-center gap-2">
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
    </div>
  </div>

  <div class="calendar-container">
    <?php
      drawCalendar($currentYear, $currentMonth, $billsCurrent, $billsPaidCurrent);
      drawCalendar($nextYear, $nextMonth, $billsNext, $billsPaidNext);
    ?>
  </div>

  <div class="legend mt-4">
    <span class="bg-info-subtle text-primary border border-info">📅 Scheduled Bill</span>
    <span class="bg-success-subtle text-success border border-success">✅ Paid Bill</span>
  </div>
</body>
</html>
