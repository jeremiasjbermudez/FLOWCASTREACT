<?php
// add_bill.php

header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);

$bill = $data['Bill'];
$dates = $data['DayOfMonth'];
$amount = $data['Amount'];
$actual = $data['ActualAmnt'];
$contains = $data['ContainsText'];
$account = $data['Account'];

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$stmt = $conn->prepare("INSERT INTO Bills (Bill, DayOfMonth, Amount, ActualAmnt, ContainsText, Account) VALUES (?, ?, ?, ?, ?, ?)");

foreach ($dates as $date) {
    $stmt->bind_param("ssddss", $bill, $date, $amount, $actual, $contains, $account);
    $stmt->execute();
}

$stmt->close();
$conn->close();
echo json_encode(["status" => "success"]);
?>