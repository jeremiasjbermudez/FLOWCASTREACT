<?php
// fetch_forecast.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    ob_start();
    include __DIR__ . '/db_refresh_forecast.php';
    ob_end_clean();
} catch (Throwable $e) {
    // Silent fail
}

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("<div class='alert alert-danger'>DB connection failed: {$conn->connect_error}</div>");
}

$q     = isset($_GET['q'])     ? $conn->real_escape_string($_GET['q'])     : '';
$start = isset($_GET['start']) ? $conn->real_escape_string($_GET['start']) : '';
$end   = isset($_GET['end'])   ? $conn->real_escape_string($_GET['end'])   : '';

$whereClauses = [];
if ($start) $whereClauses[] = "Date >= '$start'";
if ($end)   $whereClauses[] = "Date <= '$end'";
if ($q !== '') $whereClauses[] = "(Date LIKE '%$q%' OR Description LIKE '%$q%')";
$whereSql = count($whereClauses) ? ' AND ' . implode(' AND ', $whereClauses) : '';

$accounts = [
    'spending' => '💳 Spending',
    'reserve'  => '🛡️ Reserve',
    'growth'   => '📈 Growth'
];

$totalNetAll = 0;
$nets = [];

// First, find the date of the 5737 PAYROLL entry from reserve
$payrollDate = '';
$res = $conn->query("SELECT Date FROM reserve WHERE Description LIKE '%5737 PAYROLL%' AND Date <= CURDATE() ORDER BY Date DESC LIMIT 1");
if ($res && $row = $res->fetch_assoc()) {
    $payrollDate = $row['Date'];
}

foreach (array_keys($accounts) as $acctKey) {
    $startBalance = 0;
    $excludeCondition = '';

    // Get the row with the highest balance on the payroll date for this account
    $balRowRes = $conn->query("SELECT ID, Balance FROM Forecast WHERE Account = '$acctKey' AND Date = '$payrollDate' ORDER BY Balance DESC LIMIT 1");
    $excludeId = null;
    if ($balRowRes && $row = $balRowRes->fetch_assoc()) {
        $startBalance = (float)$row['Balance'];
        $excludeId = (int)$row['ID'];
        $excludeCondition = " AND NOT (ID = $excludeId)";
    }

    // Build filter SQL
    $filterSql = "Account = '$acctKey' $whereSql" . $excludeCondition;

    // Calculate totals excluding the selected start row
    $res = $conn->query("SELECT COALESCE(SUM(Deposits),0) AS deposits, COALESCE(SUM(Withdrawals),0) AS withdrawals FROM Forecast WHERE $filterSql");
    $row = $res->fetch_assoc();
    $net = $startBalance + $row['deposits'] - $row['withdrawals'];

    $nets[$acctKey] = [
        'start_balance' => $startBalance,
        'deposits' => $row['deposits'],
        'withdrawals' => $row['withdrawals'],
        'net' => $net
    ];
    $totalNetAll += $net;
}

// Output

echo "<div class='row gx-4'>";

foreach ($accounts as $acctKey => $acctLabel) {
    echo "<div class='col-md-4'>";

    if ($acctKey === 'spending') {
        echo "<div class='card mb-3 shadow-sm' style='background-color: #e6ccff; border: 1px solid #c9a6ff;'>
                <div class='card-body'>
                    <h6 class='card-title mb-1'>🧣 Combined Net Forecast</h6>
                    <p class='card-text fs-5 mb-0'><strong>Total:</strong> $" . number_format((float)($totalNetAll ?? 0), 2) . "</p>
                </div>
              </div>";
    } else {
        echo "<div class='mb-3' style='height: 96px;'></div>";
    }

    $bg = [
        'spending' => '#d0ebff',
        'reserve'  => '#d3f9d8',
        'growth'   => '#fff3bf'
    ][$acctKey];

    $tot = $nets[$acctKey];
    $net = $tot['net'];

    echo "<div class='summary-bar p-3 rounded shadow-sm mb-3' style='background-color: {$bg};'>
            <h5 class='mb-2'>{$acctLabel} Net Forecast</h5>
            <div>
                <strong>Start Balance:</strong> $" . number_format((float)($tot['start_balance'] ?? 0), 2) . "<br>
                <strong>Deposits:</strong> $" . number_format((float)($tot['deposits'] ?? 0), 2) . "<br>
                <strong>Withdrawals:</strong> $" . number_format((float)($tot['withdrawals'] ?? 0), 2) . "<br>
                <strong>Net:</strong> <span class='" . ($net < 0 ? 'text-danger' : 'text-success') . "'>$" . number_format((float)($net ?? 0), 2) . "</span>
            </div>
          </div>";

    echo "<div class='table-wrapper bg-white p-3 rounded shadow-sm'>
            <table class='table table-hover table-bordered mb-0'>
              <thead class='table-light'><tr>
                <th>Date</th><th>Description</th><th>Withdrawals</th><th>Deposits</th><th>Balance</th>
              </tr></thead>
              <tbody>";

    $res = $conn->query("SELECT Date, Description, Withdrawals, Deposits, Balance FROM Forecast WHERE Account = '$acctKey' $whereSql ORDER BY Date DESC");
    if ($res && $res->num_rows > 0) {
        while ($r = $res->fetch_assoc()) {
            echo "<tr>
                    <td>{$r['Date']}</td>
                    <td>{$r['Description']}</td>
                    <td>{$r['Withdrawals']}</td>
                    <td>{$r['Deposits']}</td>
                    <td>{$r['Balance']}</td>
                  </tr>";
        }
    } else {
        echo "<tr><td colspan='5'>No records found.</td></tr>";
    }

    echo "</tbody></table></div></div>";
}

echo "</div>";
$conn->close();
