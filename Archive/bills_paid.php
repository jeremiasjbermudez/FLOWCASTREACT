<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die('Connection failed: ' . $conn->connect_error);

$accounts = ['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'];

// Date filter logic
$today = date('Y-m-d');
$monthDay = date('j');
$monthStart = date('Y-m-01');
$monthEnd = date('Y-m-t');
$defaultStart = $monthStart;
$defaultEnd = ($monthDay <= 15) ? date('Y-m-15') : $monthEnd;

$start = $_GET['start'] ?? $defaultStart;
$end = $_GET['end'] ?? $defaultEnd;
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bills Paid</title>
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
      margin-bottom: 30px;
    }
    .form-label-sm {
      font-size: 0.8rem;
      color: #ddd;
    }
  </style>
</head>
<body>

<!-- Header with Nav + Date Filter -->
<div class="header d-flex flex-wrap justify-content-between align-items-end gap-3">
  <div>
    <h4>🪙 Bills Paid Dashboard</h4>
  </div>
  <div class="d-flex flex-wrap align-items-center gap-2 mt-3">
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
    <input type="text" id="searchInput" class="form-control form-control-sm" placeholder="Search bills...">
  </div>
</div>
<div>
<button class="btn btn-outline-secondary btn-sm" onclick="populateBillsPaid()">🧩 Populate Bills Paid</button>
<form method="GET" class="d-flex flex-wrap align-items-end gap-2">
    <div>
      <label for="start" class="form-label form-label-sm mb-0">Start</label>
      <input type="date" name="start" id="start" class="form-control form-control-sm" value="<?= $start ?>">
    </div>
    <div>
      <label for="end" class="form-label form-label-sm mb-0">End</label>
      <input type="date" name="end" id="end" class="form-control form-control-sm" value="<?= $end ?>">
    </div>
    <button type="submit" class="btn btn-sm btn-light mt-2">Filter</button>
    <a href="billspaid.php" class="btn btn-sm btn-outline-light mt-2">Show All</a>
  </form>
  </div>
<!-- Results -->
<div class="d-flex flex-column gap-4" id="resultsContainer">
<?php foreach ($accounts as $key => $label): ?>
  <div class="table-wrapper">
    <h3><?= $label ?> Bills Paid</h3>
    <table class="table table-striped" data-account="<?= $key ?>">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Account</th>
        </tr>
      </thead>
      <tbody>
        <?php
          $sql = "SELECT * FROM BillsPaid WHERE Account = '$key' AND Date BETWEEN '$start' AND '$end' ORDER BY Date DESC";
          $res = $conn->query($sql);
          while ($row = $res->fetch_assoc()):
        ?>
        <tr>
          <td><?= htmlspecialchars($row['Description']) ?></td>
          <td><?= htmlspecialchars($row['Amount']) ?></td>
          <td><?= htmlspecialchars($row['Date']) ?></td>
          <td><?= ucfirst($row['Account']) ?></td>
        </tr>
        <?php endwhile; ?>
      </tbody>
    </table>
  </div>
<?php endforeach; ?>
</div>

<?php $conn->close(); ?>

<script>
const searchInput = document.getElementById('searchInput');
const resultContainer = document.getElementById('resultsContainer');

function loadBillsPaid(query = '') {
  fetch(`fetch_bills_paid.php?search=${encodeURIComponent(query)}`)
    .then(res => res.text())
    .then(html => {
      resultContainer.innerHTML = html;
    });
}

searchInput.addEventListener('input', () => {
  loadBillsPaid(searchInput.value);
});

function populateBillsPaid() {
  fetch('populate_bills_paid.php')
    .then(res => res.text())
    .then(msg => {
      alert(msg || 'Bills Paid populated.');
      loadBillsPaid();
    });
}


</script>

</body>
</html>
