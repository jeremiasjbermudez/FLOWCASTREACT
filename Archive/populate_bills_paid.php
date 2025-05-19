<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die('Connection failed: ' . $conn->connect_error);

// 1. Get Bills with ContainsText
$bills = $conn->query("SELECT ContainsText, Amount, Account FROM Bills WHERE ContainsText IS NOT NULL AND TRIM(ContainsText) != ''");
if (!$bills) die("Failed to fetch Bills: " . $conn->error);

$inserted = 0;

while ($bill = $bills->fetch_assoc()) {
    $contains = $conn->real_escape_string($bill['ContainsText']);
    $amount = $bill['Amount'];
    $account = $bill['Account'];

    // 2. Search BillsPaid for matching descriptions
    $paidMatches = $conn->query("
    SELECT Description, Withdrawals AS Amount, Date, 'Reserve' AS Account 
    FROM Reserve 
    WHERE Description LIKE '%$contains%' AND Withdrawals = $amount
    UNION ALL
    SELECT Description, Withdrawals AS Amount, Date, 'Spending' AS Account 
    FROM Spending 
    WHERE Description LIKE '%$contains%' AND Withdrawals = $amount
    UNION ALL
    SELECT Description, Withdrawals AS Amount, Date, 'Growth' AS Account 
    FROM Growth 
    WHERE Description LIKE '%$contains%' AND Withdrawals = $amount
");


    if ($paidMatches) {
        while ($row = $paidMatches->fetch_assoc()) {
            // 3. Check if already inserted
            $desc = $conn->real_escape_string($row['Description']);
            $amt = $row['Amount'];
            $date = $row['Date'];
            $acc = $row['Account'];

            $check = $conn->query("
                SELECT COUNT(*) AS cnt 
                FROM BillsPaid 
                WHERE Description = '$desc' AND Amount = $amt AND Date = '$date' AND Account = '$acc'
            ");
            $exists = $check->fetch_assoc()['cnt'];

            if ($exists == 0) {
                $conn->query("
                    INSERT INTO BillsPaid (Description, Amount, Date, Account)
                    VALUES ('$desc', $amt, '$date', '$acc')
                ");
                $inserted++;
            }
        }
    }
}

echo "$inserted bill(s) inserted into BillsPaid.";

$conn->close();
?>
