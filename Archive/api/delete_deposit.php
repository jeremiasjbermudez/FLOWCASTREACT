<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
    exit;
}

$id = $_POST['id'] ?? null;
if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM Deposits WHERE id = ?");
$stmt->bind_param("i", $id);

echo $stmt->execute()
    ? json_encode(['status' => 'success'])
    : json_encode(['status' => 'error', 'message' => $stmt->error]);

$stmt->close();
$conn->close();
