<?php
// add_deposit.php

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$bill = $conn->real_escape_string($_POST['Bill']);
$amount = floatval($_POST['Amount']);
$account = $conn->real_escape_string($_POST['Account']);
$dates = $_POST['DateAdded'];

foreach ($dates as $date) {
    $date = $conn->real_escape_string($date);
    $sql = "INSERT INTO Deposits (Bill, Amount, Account, DateAdded) VALUES ('$bill', $amount, '$account', '$date')";
    $conn->query($sql);
}

$conn->close();
echo "Deposit(s) added successfully";
?>
