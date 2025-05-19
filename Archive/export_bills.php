<?php
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="bills_export_' . date('Ymd_His') . '.csv"');

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die('DB connection error');

// Filters
$account = $_GET['account'] ?? '';
$start   = $_GET['start'] ?? '1900-01-01';
$end     = $_GET['end'] ?? date('Y-m-d');
$q       = $_GET['q'] ?? '';

if (!in_array($account, ['spending', 'reserve', 'growth'])) {
  die('Invalid account');
}

$where = "WHERE Account = '$account' AND DayOfMonth >= '$start' AND DayOfMonth <= '$end'";
if ($q !== '') {
  $like = "%" . $conn->real_escape_string($q) . "%";
  $where .= " AND (Bill LIKE '$like' OR ContainsText LIKE '$like')";
}

$sql = "SELECT Bill, Amount, DayOfMonth, Account, ContainsText FROM Bills $where ORDER BY DayOfMonth DESC";
$res = $conn->query($sql);

$output = fopen('php://output', 'w');
fputcsv($output, ['Bill', 'Amount', 'DayOfMonth', 'Account', 'ContainsText']);

if ($res && $res->num_rows > 0) {
  while ($row = $res->fetch_assoc()) {
    fputcsv($output, [
      $row['Bill'],
      $row['Amount'],
      $row['DayOfMonth'],
      $row['Account'],
      $row['ContainsText']
    ]);
  }
}
fclose($output);
$conn->close();
exit;
