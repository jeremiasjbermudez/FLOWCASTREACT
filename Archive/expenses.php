<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Finance Dashboard - Expenses</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #f0f4f8; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    .header { background: linear-gradient(90deg, #2c3e50, #34495e); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .header h1 { margin: 0; font-size: 2rem; }
    .table-wrapper { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); flex: 1 1 32%; min-width: 300px; max-width: 100%; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="header d-flex flex-wrap justify-content-between align-items-center">
    <h4>💵Expenses Dashboard</h4>
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
      <div class="search-bar ms-2">
        <input type="text" id="searchInput" class="form-control" placeholder="Search expenses.">
      </div>
    </div>
  </div>

  <div class="container">
    <h2 class="mb-4">Add Expense</h2>
    <form method="POST" action="add_expenses.php" class="row g-2 mb-4">
      <div class="col-sm-3"><input name="Bill" type="text" class="form-control" placeholder="Bill Name" required></div>
      <div class="col-sm-2"><input name="Amount" type="number" step="0.01" class="form-control" placeholder="Amount" required></div>
      <div class="col-sm-2">
        <select name="Account" class="form-select">
          <option value="spending">Spending</option>
          <option value="reserve">Reserve</option>
          <option value="growth">Growth</option>
        </select>
      </div>
      <div class="col-sm-3">
        <div id="date-container">
          <input name="DateAdded[]" type="date" class="form-control mb-2" required>
        </div>
        <button type="button" id="addDateBtn" class="btn btn-outline-secondary btn-sm">+ Add Date</button>
      </div>
      <div class="col-sm-2"><button type="submit" class="btn btn-danger w-100">Add Expense</button></div>
    </form>

    <div id="expensesTables" class="d-flex flex-column w-100 gap-4">
      <?php include 'fetch_expenses.php'; ?>
    </div>
  </div>

  <script src="expenses.js"></script>
  <script>
    document.getElementById('addDateBtn').addEventListener('click', function(){
      const container = document.getElementById('date-container');
      const input = document.createElement('input');
      input.type = 'date';
      input.name = 'DateAdded[]';
      input.className = 'form-control mb-2';
      container.appendChild(input);
    });
  </script>
</body>
</html>
