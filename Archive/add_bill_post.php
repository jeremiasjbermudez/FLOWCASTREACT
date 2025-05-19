<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Get and sanitize fields
$bill         = $conn->real_escape_string($_POST['Bill']);
$amount       = floatval($_POST['Amount']);
$account      = $conn->real_escape_string($_POST['Account']);
$containsText = $conn->real_escape_string($_POST['ContainsText']);
$dates        = $_POST['DayOfMonth'] ?? [];

$successCount = 0;

foreach ($dates as $date) {
    $date = $conn->real_escape_string($date);
    $sql = "
        INSERT INTO Bills (Bill, Amount, Account, DayOfMonth, ContainsText)
        VALUES ('$bill', $amount, '$account', '$date', '$containsText')
    ";
    if ($conn->query($sql)) {
        $successCount++;
    } else {
        echo "Error inserting: " . $conn->error;
    }
}

$conn->close();

// Redirect back to bills.php
header("Location: bills.php");
exit;
?>
