<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = intval($_GET['id']);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $bill = $_POST['Bill'];
    $amount = floatval($_POST['Amount']);
    $account = $_POST['Account'];
    $date = $_POST['DateAdded'];
    $sql = "UPDATE Expenses SET Bill='$bill', Amount=$amount, Account='$account', DateAdded='$date' WHERE id=$id";
    if ($conn->query($sql) === TRUE) {
        echo "<p>Expenses updated successfully.</p><a href='expensess.php'>Back</a>";
    } else {
        echo "Error updating record: " . $conn->error;
    }
} else {
    $sql = "SELECT * FROM Expenses WHERE id=$id";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        ?>
        <form method="POST">
            <input name="Bill" value="<?= $row['Bill'] ?>" required>
            <input name="Amount" type="number" step="0.01" value="<?= $row['Amount'] ?>" required>
            <select name="Account">
                <option value="spending" <?= $row['Account']=='spending'?'selected':'' ?>>Spending</option>
                <option value="reserve" <?= $row['Account']=='reserve'?'selected':'' ?>>Reserve</option>
                <option value="growth" <?= $row['Account']=='growth'?'selected':'' ?>>Growth</option>
            </select>
            <input name="DateAdded" type="date" value="<?= $row['DateAdded'] ?>" required>
            <button type="submit">Update</button>
        </form>
        <?php
    } else {
        echo "Record not found.";
    }
}
$conn->close();
?>