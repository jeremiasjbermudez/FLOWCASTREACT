<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $goal = $_POST["goal"];
    $amount = floatval($_POST["amount"]);
    $paydate = $_POST["paydate"];
    $desc = $_POST["description"];

    $stmt = $conn->prepare("INSERT INTO goalswd (Goal, Type, Amount, PayDate, Description) VALUES (?, 'Deposit', ?, ?, ?)");
    $stmt->bind_param("sdss", $goal, $amount, $paydate, $desc);
    $stmt->execute();

    $conn->query("UPDATE goals 
        SET Deposits = Deposits + $amount, 
            TotalDCount = TotalDCount + 1, 
            CurrentBalance = CurrentBalance + $amount 
        WHERE Name = '$goal'");
}
?>
