<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$tables = ['Spending', 'Reserve', 'Growth'];
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';

foreach ($tables as $table) {
    echo "<div class='table-wrapper'><h3>$table Account</h3>";
    echo "<table class='table table-hover table-bordered'>
            <thead class='table-light'>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Withdrawals</th>
                    <th>Deposits</th>
                    <th>Category</th>
                    <th>Balance</th>
                </tr>";

    // Check if 'Category' column exists
    $columnsResult = $conn->query("SHOW COLUMNS FROM $table");
    $hasCategory = false;
    if ($columnsResult) {
        while ($col = $columnsResult->fetch_assoc()) {
            if ($col['Field'] === 'Category') {
                $hasCategory = true;
                break;
            }
        }
    }

    // Build totals query safely
    $whereClause = "";
    if ($search !== '') {
        $searchCond = "Description LIKE '%$search%'";
        if ($hasCategory) $searchCond .= " OR Category LIKE '%$search%'";
        $whereClause = "WHERE $searchCond";
    }

    $totalQuery = "SELECT 
                      SUM(Withdrawals) AS TotalWithdrawals, 
                      SUM(Deposits) AS TotalDeposits, 
                      SUM(Balance) AS TotalBalance 
                   FROM $table $whereClause";

    $totalResult = $conn->query($totalQuery);
    $totals = $totalResult->fetch_assoc();

    echo "<tr>
            <th colspan='2'>Totals:</th>
            <th>" . number_format((float)$totals['TotalWithdrawals'], 2) . "</th>
            <th>" . number_format((float)$totals['TotalDeposits'], 2) . "</th>
            <th></th>
            <th>" . number_format((float)$totals['TotalBalance'], 2) . "</th>
          </tr>
          </thead><tbody>";

    // Data query
    $dataQuery = "SELECT * FROM $table $whereClause ORDER BY Date DESC";
    $result = $conn->query($dataQuery);

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo "<tr>
                    <td>{$row['Date']}</td>
                    <td>{$row['Description']}</td>
                    <td>{$row['Withdrawals']}</td>
                    <td>{$row['Deposits']}</td>";
            echo $hasCategory ? "<td>{$row['Category']}</td>" : "<td>-</td>";
            echo "<td>{$row['Balance']}</td>
                  </tr>";
        }
    } else {
        echo "<tr><td colspan='6' class='text-center text-muted'>No data found.</td></tr>";
    }

    echo "</tbody></table></div>";
}
?>
