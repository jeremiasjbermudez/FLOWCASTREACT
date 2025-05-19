<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$id = $_POST['id'];
$conn->query("DELETE FROM Bills WHERE id = $id");
$conn->close();
?>
