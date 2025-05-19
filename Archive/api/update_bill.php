<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
  echo json_encode(['status' => 'error', 'message' => 'DB connect fail']);
  exit;
}

$id = $_POST['id'] ?? '';
$Bill = $_POST['Bill'] ?? '';
$Amount = $_POST['Amount'] ?? '';
$DayOfMonth = $_POST['DayOfMonth'] ?? '';
$Account = $_POST['Account'] ?? '';
$ContainsText = $_POST['ContainsText'] ?? '';

$sql = "UPDATE Bills SET Bill=?, Amount=?, DayOfMonth=?, Account=?, ContainsText=? WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sdsssi", $Bill, $Amount, $DayOfMonth, $Account, $ContainsText, $id);
if ($stmt->execute()) {
  echo json_encode(['status' => 'success']);
} else {
  echo json_encode(['status' => 'error', 'message' => $stmt->error]);
}
$conn->close();
