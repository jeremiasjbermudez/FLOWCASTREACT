<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $description = $_POST["description"];
    $category = $_POST["category"];
    $balance = $_POST["current_balance"];
    $interest = $_POST["interest_rate"];
    $documents = $_POST["documents"];

    $stmt = $conn->prepare("INSERT INTO goals (Name, Description, Category, CurrentBalance, Withdraws, TotalWCount, Deposits, TotalDCount, InterestRate, Documents)
                            VALUES (?, ?, ?, ?, 0.00, 0, 0.00, 0, ?, ?)");
    $stmt->bind_param("sssdds", $name, $description, $category, $balance, $interest, $documents);
    $stmt->execute();

    echo "Goal added successfully.";
}
?>
<form method="post">
    <input type="text" name="name" placeholder="Name" required><br>
    <textarea name="description" placeholder="Description"></textarea><br>
    <input type="text" name="category" placeholder="Category"><br>
    <input type="number" step="0.01" name="current_balance" placeholder="Starting Balance"><br>
    <input type="number" step="0.01" name="interest_rate" placeholder="Interest Rate"><br>
    <textarea name="documents" placeholder="Documents (optional)"></textarea><br>
    <button type="submit">Add Goal</button>
</form>
