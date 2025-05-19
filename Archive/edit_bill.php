<?php
$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB error");
$stmt = $conn->prepare("UPDATE Bills SET Bill=?, DayOfMonth=?, Amount=?, ActualAmnt=?, ContainsText=?, Account=? WHERE id=?");
$stmt->bind_param("ssddssi", $data['Bill'], $data['DayOfMonth'], $data['Amount'], $data['ActualAmnt'], $data['ContainsText'], $data['Account'], $data['id']);
$stmt->execute();
$stmt->close(); $conn->close();
?>