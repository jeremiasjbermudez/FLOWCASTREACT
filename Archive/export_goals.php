
<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="goals_export.csv"');

$output = fopen('php://output', 'w');

$headers = ['ID', 'Name', 'Description', 'Category', 'CurrentBalance', 'TotalPymnts', 'NumPymnts', 'AmtPerPmnt', 'PayDates', 'Expenses', 'InterestRate', 'Documents'];
for ($i = 1; $i <= 10; $i++) $headers[] = "Custom$i";
fputcsv($output, $headers);

$result = $conn->query("SELECT * FROM Goals ORDER BY ID DESC");
while ($row = $result->fetch_assoc()) {
    $line = [];
    foreach ($headers as $h) $line[] = $row[$h];
    fputcsv($output, $line);
}

fclose($output);
$conn->close();
