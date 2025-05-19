<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
    exit;
}

$id         = $_POST['id'] ?? null;
$bill       = $_POST['Bill'] ?? '';
$amount     = isset($_POST['Amount']) ? floatval($_POST['Amount']) : 0;
$date       = $_POST['DateAdded'] ?? '';
$account    = $_POST['Account'] ?? '';
$dayOfMonth = isset($_POST['DayOfMonth']) ? intval($_POST['DayOfMonth']) : null;

if (!$id || $bill === '' || $date === '' || $account === '') {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit;
}

$stmt = $conn->prepare("UPDATE Deposits SET Bill=?, Amount=?, DateAdded=?, Account=?, DayOfMonth=? WHERE id=?");
$stmt->bind_param("sdssii", $bill, $amount, $date, $account, $dayOfMonth, $id);

echo $stmt->execute()
    ? json_encode(['status' => 'success'])
    : json_encode(['status' => 'error', 'message' => $stmt->error]);

$stmt->close();
$conn->close();
