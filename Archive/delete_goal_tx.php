// delete_goal_tx.php
<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id'])) {
    $id = (int)$_POST['id'];
    $stmt = $conn->prepare("DELETE FROM goalswd WHERE ID = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo "Transaction deleted successfully.";
    } else {
        echo "Error deleting transaction: " . $conn->error;
    }
} else {
    echo "Invalid request.";
}
?>
