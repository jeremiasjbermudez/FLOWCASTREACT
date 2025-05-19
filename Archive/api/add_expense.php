<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
    exit;
}

$bill    = $_POST['Bill'] ?? '';
$amount  = isset($_POST['Amount']) ? floatval($_POST['Amount']) : 0;
$date    = $_POST['DateAdded'] ?? '';
$account = $_POST['Account'] ?? '';
$day     = isset($_POST['DayOfMonth']) ? intval($_POST['DayOfMonth']) : null;

if ($bill === '' || $date === '' || $account === '') {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO Expenses (Bill, Amount, DateAdded, Account, DayOfMonth) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sdssi", $bill, $amount, $date, $account, $day);

echo $stmt->execute()
    ? json_encode(['status' => 'success'])
    : json_encode(['status' => 'error', 'message' => $stmt->error]);

$stmt->close();
$conn->close();
