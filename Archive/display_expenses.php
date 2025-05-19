<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$result = $conn->query("SELECT * FROM Expenses ORDER BY DateAdded DESC");

$grouped = ['Spending' => [], 'Reserve' => [], 'Growth' => []];
while ($row = $result->fetch_assoc()) {
    $grouped[$row['Account']][] = $row;
}

foreach ($grouped as $account => $entries) {
    echo "<div class='mb-4'><h5 class='text-primary fw-bold'>$account</h5>";
    echo "<div class='table-responsive'><table class='table table-bordered'><thead class='table-light'>
        <tr><th>Date</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead><tbody>";
    $total = 0;
    foreach ($entries as $row) {
        $total += $row['Amount'];
        $id = $row['ID'];
        echo "<tr>
            <td>{$row['DateAdded']}</td>
            <td>{$row['Bill']}</td>
            <td>\${$row['Amount']}</td>
            <td>
                <a href='edit_expense.php?id=$id' class='btn btn-warning btn-sm'>Edit</a>
                <a href='delete_expense.php?id=$id' class='btn btn-danger btn-sm'>Delete</a>
            </td>
        </tr>";
    }
    echo "<tr class='fw-bold'><td colspan='2'>Total:</td><td>\$" . number_format($total, 2) . "</td><td></td></tr>";
    echo "</tbody></table></div></div>";
}
$conn->close();
?>