// delete_goal.php (delete a goal only if no transactions exist)
<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id'])) {
    $id = (int)$_POST['id'];
    $check = $conn->query("SELECT Name FROM goals WHERE ID = $id");
    if ($check && $check->num_rows > 0) {
        $goal = $check->fetch_assoc()['Name'];
        $count = $conn->query("SELECT COUNT(*) AS cnt FROM goalswd WHERE Goal = '" . $conn->real_escape_string($goal) . "'")->fetch_assoc()['cnt'];
        if ($count == 0) {
            $conn->query("DELETE FROM goals WHERE ID = $id");
            echo "Goal deleted successfully.";
        } else {
            echo "Cannot delete goal with existing transactions.";
        }
    } else {
        echo "Goal not found.";
    }
} else {
    echo "Invalid request.";
}
?>