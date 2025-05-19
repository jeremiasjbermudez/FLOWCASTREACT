<?php
// add_expenses.php

// 1. Connect
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 2. Grab & sanitize POST data
$bill    = $conn->real_escape_string($_POST['Bill']);
$amount  = floatval($_POST['Amount']);
$account = $conn->real_escape_string($_POST['Account']);
$date    = $conn->real_escape_string($_POST['DateAdded']);

// 3. Insert
$sql = "
    INSERT INTO Expenses (Bill, Amount, Account, DateAdded)
    VALUES ('$bill', $amount, '$account', '$date')
";

if ($conn->query($sql) === TRUE) {
    // 4a. Success
    header("Location: expenses.php");
    exit;
} else {
    // 4b. Error
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
