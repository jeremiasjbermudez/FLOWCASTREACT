<?php
// add_bill_inline.php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$data = json_decode(file_get_contents('php://input'), true);

$bill = $conn->real_escape_string($data['Bill'] ?? '');
$amount = floatval($data['Amount'] ?? 0);
$actual = floatval($data['ActualAmnt'] ?? 0);
$text = $conn->real_escape_string($data['ContainsText'] ?? '');
$account = $conn->real_escape_string($data['Account'] ?? '');
$dates = $data['DayOfMonth'] ?? [];

foreach ($dates as $date) {
  $cleanDate = $conn->real_escape_string($date);
  $sql = "INSERT INTO Bills (Bill, Amount, ActualAmnt, ContainsText, Account, DayOfMonth)
          VALUES ('$bill', $amount, $actual, '$text', '$account', '$cleanDate')";
  $conn->query($sql);
}

$conn->close();
echo "Success";
