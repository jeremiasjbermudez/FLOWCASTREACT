<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die(json_encode(['status' => 'fail', 'message' => 'DB Error']));

$id = intval($_POST['id']);
$sql = "DELETE FROM Deposits WHERE ID = $id";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'fail', 'message' => $conn->error]);
}
$conn->close();
?>

