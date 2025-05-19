<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die('Connection failed: ' . $conn->connect_error);

$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
$accounts = ['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'];

foreach ($accounts as $key => $label):
  echo "<div class='table-wrapper mb-4'>";
  echo "<h3>$label Bills Paid</h3>";
  echo "<table class='table table-striped' data-account='$key'>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>";

  $sql = "SELECT * FROM BillsPaid WHERE Account = '$key'";
  if ($search) {
    $sql .= " AND (Description LIKE '%$search%' OR Amount LIKE '%$search%' OR Date LIKE '%$search%' OR Account LIKE '%$search%')";
  }
  $sql .= " ORDER BY Date DESC";
  $res = $conn->query($sql);

  while ($row = $res->fetch_assoc()) {
    echo "<tr>
            <td>" . htmlspecialchars($row['Description']) . "</td>
            <td>" . htmlspecialchars($row['Amount']) . "</td>
            <td>" . htmlspecialchars($row['Date']) . "</td>
            <td>" . ucfirst($row['Account']) . "</td>
          </tr>";
  }

  echo "</tbody></table></div>";
endforeach;

$conn->close();
