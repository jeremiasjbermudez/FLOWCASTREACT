<div class='vertical-stack'>
<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
$accounts = ['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'];

$paidRes = $conn->query("SELECT Description FROM BillsPaid");
$paidDescriptions = [];
while ($r = $paidRes->fetch_assoc()) {
  $paidDescriptions[] = strtolower($r['Description']);
}

function isPaid($containsText, $paidDescriptions) {
  if (!$containsText) return false;
  foreach ($paidDescriptions as $desc) {
    if (str_contains($desc, strtolower($containsText))) return true;
  }
  return false;
}

foreach ($accounts as $key => $label) {
  echo "<div class='table-wrapper'><h3>$label Bills</h3>
        <table class='table table-striped' data-account='$key'>
        <thead><tr>
        <th>Bill</th><th>Amount</th><th>Date</th><th>ContainsText</th><th>Account</th><th>Actions</th>
        </tr></thead><tbody>";

  $sql = "SELECT * FROM Bills WHERE Account = '$key' AND Bill LIKE '%{$search}%' ORDER BY DayOfMonth DESC";
  $res = $conn->query($sql);

  while ($row = $res->fetch_assoc()) {
    $date = ($row['DayOfMonth'] == '0000-00-00' || !$row['DayOfMonth']) ? '' : $row['DayOfMonth'];
    $highlight = isPaid($row['ContainsText'], $paidDescriptions) ? "table-success" : "";

    echo "<tr data-id='{$row['id']}' class='$highlight'>
      <td><input class='form-control form-control-sm Bill' value='{$row['Bill']}' readonly></td>
      <td><input class='form-control form-control-sm Amount' value='{$row['Amount']}' readonly></td>
      <td><input type='date' class='form-control form-control-sm DayOfMonth' value='$date' readonly></td>
      <td><input class='form-control form-control-sm ContainsText' value='{$row['ContainsText']}' readonly></td>
      <td>
        <select class='form-select form-select-sm Account' disabled>
          <option value='spending' " . ($row['Account'] == 'spending' ? 'selected' : '') . ">Spending</option>
          <option value='reserve' " . ($row['Account'] == 'reserve' ? 'selected' : '') . ">Reserve</option>
          <option value='growth' " . ($row['Account'] == 'growth' ? 'selected' : '') . ">Growth</option>
        </select>
      </td>
      <td>
        <button class='btn btn-sm btn-warning edit-btn'>Edit</button>
        <button class='btn btn-sm btn-success save-btn d-none'>Save</button>
        <button class='btn btn-sm btn-danger delete-btn'>Delete</button>
      </td>
    </tr>";
  }

  echo "</tbody></table></div>";
}

$conn->close();
?>
</div>
?>
