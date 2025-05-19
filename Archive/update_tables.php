<?php
// update_tables.php

// --- CONFIGURATION ---
$servername = "localhost";
$username   = "admin";
$password   = "ti@A4pnc";
$dbname     = "PNCaccounts";

// Where to store uploaded CSVs temporarily
$uploadDir = __DIR__ . '/csv_uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// --- COMMON FUNCTIONS (same as in upload.php) ---
function cleanMoney($value) {
    $value = str_replace(['$', ',', ' '], '', $value);
    return $value !== '' ? floatval($value) : null;
}

function cleanDate($dateStr) {
    return date('Y-m-d', strtotime($dateStr));
}

function rowExists($conn, $table, $date, $description, $amountColumn, $amountValue) {
    $stmt = $conn->prepare("
        SELECT COUNT(*) 
        FROM `$table` 
        WHERE `Date` = ? 
          AND `Description` = ? 
          AND `$amountColumn` = ?
    ");
    $stmt->bind_param("ssd", $date, $description, $amountValue);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    return $count > 0;
}

function importCSV($conn, $csvFile, $tableName) {
    if (!file_exists($csvFile)) {
        echo "<p style='color:red;'>File for {$tableName} not found.</p>";
        return;
    }
    $file = fopen($csvFile, 'r');
    fgetcsv($file); // skip header
    $new = 0;

    while ($row = fgetcsv($file)) {
        if ($tableName === 'Spending') {
            list($date, $description, $withdrawals, $deposits, $category, $balance) = $row;
            $date        = cleanDate($date);
            $description = $conn->real_escape_string($description);
            $withdrawals = cleanMoney($withdrawals);
            $deposits    = cleanMoney($deposits);
            $category    = $conn->real_escape_string($category);
            $balance     = cleanMoney($balance);

            $mainAmt      = $deposits !== null ? $deposits : $withdrawals;
            $amountColumn = $deposits !== null ? 'Deposits' : 'Withdrawals';

            if (!rowExists($conn, $tableName, $date, $description, $amountColumn, $mainAmt)) {
                $sql = "
                    INSERT INTO Spending 
                      (Date, Description, Withdrawals, Deposits, Category, Balance)
                    VALUES 
                      (
                        '$date',
                        '$description',
                        " . ($withdrawals !== null ? $withdrawals : 'NULL') . ",
                        " . ($deposits    !== null ? $deposits    : 'NULL') . ",
                        '$category',
                        " . ($balance     !== null ? $balance     : 'NULL') . "
                      )
                ";
                if ($conn->query($sql)) {
                    $new++;
                } else {
                    echo "<p style='color:red;'>Error inserting Spending: {$conn->error}</p>";
                }
            }
        } else {
            // Reserve & Growth
            list($date, $description, $withdrawals, $deposits, $balance) = $row;
            $date        = cleanDate($date);
            $description = $conn->real_escape_string($description);
            $withdrawals = cleanMoney($withdrawals);
            $deposits    = cleanMoney($deposits);
            $balance     = cleanMoney($balance);

            $mainAmt      = $deposits !== null ? $deposits : $withdrawals;
            $amountColumn = $deposits !== null ? 'Deposits' : 'Withdrawals';

            if (!rowExists($conn, $tableName, $date, $description, $amountColumn, $mainAmt)) {
                $sql = "
                    INSERT INTO `$tableName`
                      (Date, Description, Withdrawals, Deposits, Balance)
                    VALUES
                      (
                        '$date',
                        '$description',
                        " . ($withdrawals !== null ? $withdrawals : 'NULL') . ",
                        " . ($deposits    !== null ? $deposits    : 'NULL') . ",
                        " . ($balance     !== null ? $balance     : 'NULL') . "
                      )
                ";
                if ($conn->query($sql)) {
                    $new++;
                } else {
                    echo "<p style='color:red;'>Error inserting {$tableName}: {$conn->error}</p>";
                }
            }
        }
    }

    fclose($file);
    echo "<p>Imported <strong>{$new}</strong> new rows into <strong>{$tableName}</strong>.</p>";
}

// --- PROCESS UPLOADS ON POST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("<p style='color:red;'>Connection failed: {$conn->connect_error}</p>");
    }

    foreach (['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'] as $field => $table) {
        if (!empty($_FILES[$field]['tmp_name'])) {
            $tmp  = $_FILES[$field]['tmp_name'];
            $dest = $uploadDir . "{$field}.csv";
            if (move_uploaded_file($tmp, $dest)) {
                importCSV($conn, $dest, $table);
            } else {
                echo "<p style='color:red;'>Failed to move uploaded file for {$table}.</p>";
            }
        } else {
            echo "<p style='color:orange;'>No file uploaded for {$table}.</p>";
        }
    }

    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Finance Dashboard – Update Tables</title>
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
    <h4>🛠️Upload PNC CSV</h4>
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
        <input type="text" id="searchInput" class="form-control" placeholder="Search update...">
      </div>
    </div>
  </div>

  <div class="container">
    <h2 class="mb-4">Upload CSV to Update Spending / Reserve / Growth</h2>
    <form method="post" enctype="multipart/form-data">
      
    <<?php
$pastelHeaders = [
  'spending' => '#d0ebff', // pastel blue
  'reserve'  => '#d3f9d8', // pastel green
  'growth'   => '#fff3bf'  // pastel yellow
];
?>      

<?php foreach (['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'] as $field => $label): ?>
  <div class="card mb-3">
    <div class="card-header" style="background-color: <?= $pastelHeaders[$field] ?>; font-weight: bold;">
      <?= $label ?> CSV
    </div>
    <div class="card-body">
      <input name="<?= $field ?>" type="file" accept=".csv" class="form-control" required>
    </div>
  </div>
<?php endforeach; ?>

      <button class="btn btn-primary">Import All</button>
    </form>
  </div>

  <script>
    // (optionally wire up your #searchInput to filter results dynamically)
    document.getElementById('searchInput').addEventListener('input', function(e){
      // implement client-side filtering if you like...
    });
  </script>
</body>
</html>
