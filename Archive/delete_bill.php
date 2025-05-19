
<?php
$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("Connection failed");

$stmt = $conn->prepare("DELETE FROM Bills WHERE id=?");
$stmt->bind_param("i", $data['id']);
$stmt->execute();
$stmt->close();
$conn->close();
?>
