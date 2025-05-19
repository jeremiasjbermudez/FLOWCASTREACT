<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

// Function to calculate PayOffTime in months
function calculatePayoffTime($balance, $monthlyPayment, $annualInterest) {
    if ($monthlyPayment <= 0 || $balance <= 0) return 0;

    $monthlyInterest = $annualInterest / 100 / 12;

    // Avoid divide-by-zero or negative root
    if ($monthlyInterest == 0) {
        return ceil($balance / $monthlyPayment);
    }

    $denominator = $monthlyPayment - $balance * $monthlyInterest;
    if ($denominator <= 0) return 0;

    $n = log($monthlyPayment / $denominator) / log(1 + $monthlyInterest);
    return max(0, ceil($n)); // number of months
}

$id = $_POST['id'] ?? null;
if (!$id) {
    echo "Invalid ID";
    exit;
}

// Sanitize and prepare values
$name = $_POST['Name'] ?? '';
$category = $_POST['Category'] ?? '';
$description = $_POST['Description'] ?? '';

$currentBalance = isset($_POST['CurrentBalance']) ? floatval(preg_replace('/[^\d.-]/', '', $_POST['CurrentBalance'])) : 0;
$interestRate = isset($_POST['InterestRate']) ? floatval(preg_replace('/[^\d.-]/', '', $_POST['InterestRate'])) : 0;
$estMonthlyPmt = isset($_POST['EstMonthlyPmt']) ? floatval(preg_replace('/[^\d.-]/', '', $_POST['EstMonthlyPmt'])) : 0;

// Update goal core fields
$stmt = $conn->prepare("UPDATE goals SET Name = ?, Category = ?, Description = ?, CurrentBalance = ?, InterestRate = ?, EstMonthlyPmt = ? WHERE ID = ?");
$stmt->bind_param("sssdddi", $name, $category, $description, $currentBalance, $interestRate, $estMonthlyPmt, $id);

if (!$stmt->execute()) {
    echo "Update failed: " . $stmt->error;
    exit;
}
$stmt->close();

// Now calculate PayOffTime
$payOffTime = calculatePayoffTime($currentBalance, $estMonthlyPmt, $interestRate);
$payOffTimeYrs = round($payOffTime / 12, 2);

// Update PayOffTime fields
$updatePayoff = $conn->prepare("UPDATE goals SET PayOffTime = ?, PayOffTimeYrs = ? WHERE ID = ?");
$updatePayoff->bind_param("ddi", $payOffTime, $payOffTimeYrs, $id);
$updatePayoff->execute();
$updatePayoff->close();

echo "Goal updated successfully.";
$conn->close();
?>
