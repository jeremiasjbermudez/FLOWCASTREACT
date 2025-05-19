<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Collect POST data
$bill = $conn->real_escape_string($_POST['description'] ?? '');
$amount = floatval($_POST['amount'] ?? 0);
$account = $conn->real_escape_string($_POST['account'] ?? '');
$date = $_POST['date'] ?? '';

if ($bill && $amount > 0 && $account && $date) {
    $stmt = $conn->prepare("INSERT INTO Expenses (Bill, Amount, Account, DateAdded) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sdss", $bill, $amount, $account, $date);
    $stmt->execute();
    $stmt->close();
    echo "<script>window.location.href='expenses.php';</script>";
} else {
    echo "❌ Invalid input. Please fill all fields correctly.";
}

$conn->close();
?>