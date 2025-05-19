<?php
// add_expenses.php

$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$bill    = $conn->real_escape_string($_POST['Bill']);
$amount  = floatval($_POST['Amount']);
$account = $conn->real_escape_string($_POST['Account']);

$dates = $_POST['DateAdded'];
if (!is_array($dates)) $dates = [$dates];

$errors = [];
foreach ($dates as $date) {
    $d = $conn->real_escape_string($date);
    $sql = "INSERT INTO Expenses (Bill, Amount, Account, DateAdded)
            VALUES ('$bill', $amount, '$account', '$d')";
    if (!$conn->query($sql)) {
        $errors[] = $conn->error;
    }
}

$conn->close();

if (empty($errors)) {
    header("Location: expenses.php");
    exit;
} else {
    echo "<h4>Some inserts failed:</h4><ul>";
    foreach ($errors as $e) {
        echo "<li>" . htmlspecialchars($e) . "</li>";
    }
    echo "</ul>";
}
?>