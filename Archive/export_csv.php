<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

header('Content-Type: text/csv');
header('Content-Disposition: attachment;filename="BillsPaid.csv"');

$output = fopen('php://output', 'w');
fputcsv($output, ['Date', 'Description', 'Amount', 'Source Table', 'Match Text', 'Account']);

$result = $conn->query("SELECT Date, Description, Amount, SourceTable, MatchText, Account FROM BillsPaid ORDER BY Date DESC");

if ($result) {
    while ($row = $result->fetch_assoc()) {
        fputcsv($output, $row);
    }
}
fclose($output);
$conn->close();
exit;
?>