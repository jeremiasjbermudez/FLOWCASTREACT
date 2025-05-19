// update_goal_tx.php
<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$fields = ['Type', 'Amount', 'PayDate', 'Description'];
$updates = [];

foreach ($fields as $field) {
    if (isset($_POST[$field])) {
        $val = $conn->real_escape_string($_POST[$field]);
        $updates[] = "$field = '$val'";
    }
}

if ($id && count($updates)) {
    $sql = "UPDATE goalswd SET " . implode(', ', $updates) . " WHERE ID = $id";
    if ($conn->query($sql)) {
        echo "Transaction updated successfully.";
    } else {
        echo "Update error: " . $conn->error;
    }
} else {
    echo "Invalid data submitted.";
}
?>