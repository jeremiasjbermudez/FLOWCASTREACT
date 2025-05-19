<?php
header('Content-Type: application/json');
$conn=new mysqli('localhost','admin','ti@A4pnc','PNCaccounts');
if($conn->connect_error){ echo json_encode(['status'=>'error']); exit; }
$data=json_decode(file_get_contents('php://input'),true);
$stmt=$conn->prepare("INSERT INTO Bills (Bill,DayOfMonth,Amount,ActualAmnt,ContainsText,Account) VALUES (?,?,?,?,?,?)");
$stmt->bind_param("ssddss",$data['Bill'],$data['DayOfMonth'],$data['Amount'],$data['ActualAmnt'],$data['ContainsText'],$data['Account']);
echo $stmt->execute() ? json_encode(['status'=>'success']) : json_encode(['status'=>'error']);
$conn->close();
?>