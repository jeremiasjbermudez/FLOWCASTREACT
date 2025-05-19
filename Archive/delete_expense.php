<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = intval($_GET['id']);
$sql = "DELETE FROM Expenses WHERE id=$id";
if ($conn->query($sql) === TRUE) {
    header("Location: expensess.php");
} else {
    echo "Error deleting record: " . $conn->error;
}
$conn->close();
?>