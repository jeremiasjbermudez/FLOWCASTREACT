<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
  echo json_encode(['status' => 'error', 'message' => 'DB connect fail']);
  exit;
}

$id = $_POST['id'] ?? '';
if ($id) {
  $stmt = $conn->prepare("DELETE FROM Bills WHERE id = ?");
  $stmt->bind_param("i", $id);
  if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
  } else {
    echo json_encode(['status' => 'error', 'message' => $stmt->error]);
  }
}
$conn->close();
