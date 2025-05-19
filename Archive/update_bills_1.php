<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$id = $_POST['id'];
$bill = $_POST['Bill'];
$amount = $_POST['Amount'];
$date = $_POST['DayOfMonth'];
$contains = $_POST['ContainsText'];
$account = $_POST['Account'];

$stmt = $conn->prepare("UPDATE Bills SET Bill=?, Amount=?, DayOfMonth=?, ContainsText=?, Account=? WHERE id=?");
$stmt->bind_param("sdsssi", $bill, $amount, $date, $contains, $account, $id);
$stmt->execute();
$stmt->close();
$conn->close();
?>
