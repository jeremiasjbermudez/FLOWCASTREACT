<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
$result = $conn->query("SELECT * FROM goalswd ORDER BY PayDate DESC");
?>

<h2>Goal Transactions</h2>
<table border="1" cellpadding="5">
    <tr>
        <th>ID</th>
        <th>Goal</th>
        <th>Type</th>
        <th>Amount</th>
        <th>PayDate</th>
        <th>Description</th>
    </tr>
    <?php while($row = $result->fetch_assoc()): ?>
    <tr>
        <td><?= $row['ID'] ?></td>
        <td><?= htmlspecialchars($row['Goal']) ?></td>
        <td><?= $row['Type'] ?></td>
        <td><?= number_format($row['Amount'], 2) ?></td>
        <td><?= $row['PayDate'] ?></td>
        <td><?= htmlspecialchars($row['Description']) ?></td>
    </tr>
    <?php endwhile; ?>
</table>
