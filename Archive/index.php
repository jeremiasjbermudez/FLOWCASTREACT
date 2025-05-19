<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flowcast</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .logo {
      display: block;
      margin: 30px auto;
      max-width: 200px;
      height: auto;
    }
  </style>
</head>
<body>

  <!-- Flowcast Logo -->
  <img src="images/flowcast-logo.png" alt="Flowcast Logo" class="logo">
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
        .header h1 {
            margin: 0;
            font-size: 2rem;
        }
        .nav-buttons a {
            margin-left: 10px;
            font-weight: 500;
        }
        
        .search-bar input {
            border-radius: 10px;
            padding: 0.5rem 1rem;
        }
        .tables-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: space-between;
        }
        .table-wrapper {
            background: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            flex: 1 1 32%;
            min-width: 300px;
            max-width: 100%;
            overflow-x: auto;
        }
        .table-wrapper h3 {
            font-size: 1.25rem;
            margin-bottom: 15px;
            color: #2c3e50;
        }
        .table-wrapper:nth-child(1) h3 {
    background: #add8e6; /* Pastel blue for Spending */
    padding: 10px;
    border-radius: 8px;
    color: #2c3e50;
}

.table-wrapper:nth-child(2) h3 {
    background: #b2e6b2; /* Pastel green for Reserve */
    padding: 10px;
    border-radius: 8px;
    color: #2c3e50;
}

.table-wrapper:nth-child(3) h3 {
    background: #fff9b1; /* Pastel yellow for Growth */
    padding: 10px;
    border-radius: 8px;
    color: #2c3e50;
}
/* Spending Table - Pastel Blue */
.table-wrapper:nth-child(1) table {
    background-color: #f0f8ff; /* Light blue tint */
}
.table-wrapper:nth-child(1) table tr:nth-child(even) {
    background-color: #e6f3fb;
}

/* Reserve Table - Pastel Green */
.table-wrapper:nth-child(2) table {
    background-color: #f5fff5; /* Light green tint */
}
.table-wrapper:nth-child(2) table tr:nth-child(even) {
    background-color: #e9fbe9;
}

/* Growth Table - Pastel Yellow */
.table-wrapper:nth-child(3) table {
    background-color: #fffde6; /* Light yellow tint */
}
.table-wrapper:nth-child(3) table tr:nth-child(even) {
    background-color: #fffbd1;
}

    </style>
</head>
<body>
    <div class="header d-flex flex-wrap justify-content-between align-items-center">
        <h4>🧮Finance Dashboard</h4>
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
        <input type="text" id="searchInput" class="form-control" placeholder="Search Accounts.">
      </div>
    </div>
        </div>
    </div>

    <!-- Account tables section -->
    <div id="tables" class="tables-container">
        <?php include 'fetch_data.php'; ?>
    </div>

    <script src="search.js"></script>
</body>
</html>
