
<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

$type = $_GET['type'] ?? '';
$validAccounts = ['Spending', 'Reserve', 'Growth'];

function calculateBalance($conn, $account) {
    $account = $conn->real_escape_string($account);
    $result = $conn->query("
        SELECT 
            IFNULL(SUM(CASE WHEN Account = '$account' THEN Amount ELSE 0 END), 0) -
            IFNULL((SELECT SUM(Amount) FROM Expenses WHERE Account = '$account'), 0) 
        AS Balance
        FROM Deposits
    ");
    return $result && $row = $result->fetch_assoc() ? floatval($row['Balance']) : 0;
}

$insertGoal = function($conn, $account, $balance) {
    $name = "$account Goal " . date("Y-m-d");
    $desc = "Auto-created from $account account";
    $stmt = $conn->prepare("INSERT INTO Goals (Name, Description, Category, CurrentBalance) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssd", $name, $desc, $account, $balance);
    $stmt->execute();
};

if ($type === 'All') {
    $response = [];
    foreach ($validAccounts as $acct) {
        $balance = calculateBalance($conn, $acct);
        $insertGoal($conn, $acct, $balance);
        $response[] = "$acct: $" . number_format($balance, 2);
    }
    echo "Goals loaded:\n" . implode("\n", $response);
} elseif (in_array($type, $validAccounts)) {
    $balance = calculateBalance($conn, $type);
    $insertGoal($conn, $type, $balance);
    echo "$type goal created with balance $" . number_format($balance, 2);
} else {
    echo "Invalid account type.";
}
$conn->close();
