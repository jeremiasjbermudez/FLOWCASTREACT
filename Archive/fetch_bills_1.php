<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

$start = isset($_GET['start']) ? $conn->real_escape_string($_GET['start']) : '';
$end   = isset($_GET['end'])   ? $conn->real_escape_string($_GET['end'])   : '';
$q     = isset($_GET['q'])     ? $conn->real_escape_string($_GET['q'])     : '';

$where = [];
if ($start) $where[] = "DayOfMonth >= '$start'";
if ($end)   $where[] = "DayOfMonth <= '$end'";
if ($q)     $where[] = "(Bill LIKE '%$q%' OR ContainsText LIKE '%$q%')";

$whereSql = count($where) ? 'WHERE ' . implode(' AND ', $where) : '';

$sql = "SELECT * FROM Bills $whereSql ORDER BY DayOfMonth DESC";
$result = $conn->query($sql);

$accounts = ['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'];
$grouped = [];

while ($row = $result->fetch_assoc()) {
    $grouped[$row['Account']][] = $row;
}

foreach ($accounts as $key => $label):
    $rows = $grouped[$key] ?? [];
    $tableClass = "table-$key";

    echo "<div class='table-responsive mb-4'>";
    echo "<h4>$label Bills</h4>";
    echo "<table class='table $tableClass table-bordered table-hover'>";
    echo "<thead><tr>
            <th>Bill</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Account</th>
            <th>ContainsText</th>
            <th>Actions</th>
          </tr></thead><tbody>";

    foreach ($rows as $row) {
        $matched = false;
        $contains = $row['ContainsText'];
        $amount = floatval($row['Amount']);
        $account = $row['Account'];

        if ($contains) {
            $containsEsc = $conn->real_escape_string($contains);
            $matchCheck = $conn->query("
                SELECT 1 FROM BillsPaid
                WHERE Description LIKE '%$containsEsc%'
                  AND Amount = $amount
                  AND Account = '$account'
                LIMIT 1
            ");
            if ($matchCheck && $matchCheck->num_rows > 0) {
                $matched = true;
            }
        }

        $rowClass = $matched ? 'table-success' : '';
        echo "<tr class='$rowClass' data-id='{$row['id']}'>";
        echo "<td class='Bill'>" . htmlspecialchars($row['Bill']) . "</td>";
        echo "<td class='Amount'>" . htmlspecialchars($row['Amount']) . "</td>";
        echo "<td class='DayOfMonth'>" . htmlspecialchars($row['DayOfMonth']) . "</td>";
        echo "<td><select class='form-select form-select-sm' disabled>
                <option value='spending'" . ($row['Account'] === 'spending' ? ' selected' : '') . ">Spending</option>
                <option value='reserve'" . ($row['Account'] === 'reserve' ? ' selected' : '') . ">Reserve</option>
                <option value='growth'" . ($row['Account'] === 'growth' ? ' selected' : '') . ">Growth</option>
              </select></td>";
        echo "<td class='ContainsText'>" . htmlspecialchars($row['ContainsText']) . "</td>";
        echo "<td>
                <button class='btn btn-sm btn-outline-primary edit-btn'>✏️</button>
                <button class='btn btn-sm btn-success save-btn d-none'>💾</button>
                <button class='btn btn-sm btn-outline-danger delete-btn'>🗑️</button>
              </td>";
        echo "</tr>";
    }

    echo "</tbody></table></div>";
endforeach;

$conn->close();
?>
