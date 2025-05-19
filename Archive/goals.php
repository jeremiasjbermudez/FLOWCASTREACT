<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB error: " . $conn->connect_error);
$tables = ['reserve', 'spending', 'growth'];
$goalsQuery = $conn->query("SELECT Name FROM goals");

$goalsList = [];
while ($g = $goalsQuery->fetch_assoc()) {
    $goalsList[] = $g['Name'];
}

foreach ($tables as $table) {
    $query = $conn->query("SELECT * FROM $table");
    while ($row = $query->fetch_assoc()) {
        foreach ($goalsList as $goalName) {
            if (stripos($row['Description'], $goalName) !== false) {
                $amount = $row['Deposits'] > 0 ? $row['Deposits'] : $row['Withdrawals'];
                $type = $row['Deposits'] > 0 ? 'Deposit' : 'Withdraw';

                // Avoid duplicates
                $check = $conn->prepare("SELECT COUNT(*) FROM goalswd WHERE Goal = ? AND PayDate = ? AND Amount = ? AND Description = ?");
                $check->bind_param("ssds", $goalName, $row['Date'], $amount, $row['Description']);
                $check->execute();
                $check->bind_result($exists);
                $check->fetch();
                $check->close();

                if ($exists == 0) {
                    $insert = $conn->prepare("INSERT INTO goalswd (Goal, Type, Amount, PayDate, Description) VALUES (?, ?, ?, ?, ?)");
                    $insert->bind_param("sssss", $goalName, $type, $amount, $row['Date'], $row['Description']);
                    $insert->execute();
                    $insert->close();
                }

                break; // Only insert once per matching goal
            }
        }
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Goals Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #f0f4f8; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    .header {
      background: linear-gradient(90deg, #2c3e50, #34495e);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .header h1 { margin: 0; font-size: 2rem; }
    .table-wrapper {
      background: white;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .form-control, .btn { border-radius: 10px; }
    .form-label { font-weight: 600; }
    td[contenteditable="true"]:focus { outline: 2px solid #3498db; background: #ecf0f1; }
    tfoot td { font-weight: bold; background: #f9f9f9; }
  </style>
</head>
<body>

<div class="header d-flex flex-wrap justify-content-between align-items-center">
  <h4 class>⚽ Goals Dashboard</h4>
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
<div class="table-wrapper">
  <?php include 'goal_forms.php'; ?>


<!-- Hidden iframe to run the script silently -->
<iframe id="payoffCalcFrame" name="hiddenFrame" style="display:none;"></iframe>

<div class="row">
<?php
$goalCards = $conn->query("SELECT * FROM goals");
while ($goal = $goalCards->fetch_assoc()):
    $goalID = $goal['ID'];
    $goalName = htmlspecialchars($goal['Name']);
    $category = htmlspecialchars($goal['Category']);
    $description = htmlspecialchars($goal['Description']);
    $balance = number_format($goal['CurrentBalance'], 2);
    $APR = number_format($goal['InterestRate'], 2);
    $monthlypmt = number_format($goal['EstMonthlyPmt'], 2);
    $PayOffTime = number_format((float)$goal['PayOffTime']);
    $PayOffTimeYrs = number_format((float)$goal['PayOffTimeYrs']);
    $TotalInterestPaid = number_format($goal['totalInterestPaid'], 2);

 
    $normalizedCategory = strtolower(trim($category));
    switch ($normalizedCategory) {
        case 'credit card': $headerClass = 'bg-info text-dark'; break;
        case 'savings':     $headerClass = 'bg-success bg-opacity-25 text-dark'; break;
        case 'emergency':   $headerClass = 'bg-danger bg-opacity-25 text-dark'; break;
        case 'vacation':    $headerClass = 'bg-warning bg-opacity-25 text-dark'; break;
        default:            $headerClass = 'bg-secondary bg-opacity-25 text-dark'; break;
    }
    $tx = $conn->query("SELECT * FROM goalswd WHERE Goal = '" . $conn->real_escape_string($goalName) . "' ORDER BY PayDate DESC");
?>
  <div class="col-md-4 mb-4">
    <div class="card h-100 shadow-sm">
      <div class="card-header <?= $headerClass ?>">
        <h5 class="mb-0"><?php echo $goalName; ?></h5>
      </div>
      <div class="card-body">
        <p>
         <strong>Name:</strong> <span data-field="Name"><?php echo $goalName; ?></span><br>
          <strong>Category:</strong> <span data-field="Category"><?php echo $category; ?></span><br>
          <strong>Description:</strong> <span data-field="Description"><?php echo $description; ?></span><br>
          <strong>Balance:</strong> $<span data-field="CurrentBalance"><?php echo $balance; ?></span>
          <strong>Interest:</strong> <span data-field="InterestRate"><?php echo $APR; ?>%</span><br>
          <strong>Monthly Payment:</strong> <span data-field="EstMonthlyPmt"><?php echo $monthlypmt; ?></span><br>
          <strong>Goal Reached in:</strong> <span data-field="PayOffTime"><?php echo $PayOffTime; ?> Months or</span>
          <strong></strong> <span data-field="PayOffTimeYrs"><?php echo $PayOffTimeYrs; ?> Years</span><br>
          <strong>Total Interest</strong> <span data-field="totalInterestPaid"><?php echo $TotalInterestPaid; ?> </span>

          


        </p>
        <div class="mb-2 d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary edit-goal" data-id="<?= $goalID ?>">Edit</button>
          <button class="btn btn-sm btn-outline-danger delete-goal" data-id="<?= $goalID ?>" <?= $tx->num_rows > 0 ? 'disabled' : '' ?>>Delete</button>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-bordered table-striped mb-0">
            <thead class="table-light">
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            <?php if ($tx->num_rows > 0): while ($row = $tx->fetch_assoc()): ?>
<tr data-id="<?= $row['ID'] ?>">
  <td contenteditable="false" data-field="Type"><?= htmlspecialchars($row['Type']) ?></td>
  <td contenteditable="false" data-field="Amount"><?= number_format($row['Amount'], 2) ?></td>
  <td contenteditable="false" data-field="PayDate"><?= $row['PayDate'] ?></td>
  <td contenteditable="false" data-field="Description"><?= htmlspecialchars($row['Description']) ?></td>
  <td>
    <button class="btn btn-sm btn-primary edit-entry">Edit</button>
    <button class="btn btn-sm btn-danger delete-entry">Delete</button>
  </td>
</tr>
<?php endwhile; else: ?>
<tr><td colspan="5" class="text-center text-muted">No transactions</td></tr>
<?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
<?php endwhile; ?>
</div>

<script src="goal_scripts.js"></script>


</body>
</html>
