<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB connection failed: " . $conn->connect_error);

// Recalculate PayOffTime and TotalInterestPaid for each goal
function calculatePayoffTime($balance, $monthlyPayment, $annualInterest) {
    if ($monthlyPayment <= 0 || $balance <= 0) return 0;

    $monthlyInterest = $annualInterest / 100 / 12;

    if ($monthlyInterest == 0) {
        return ceil($balance / $monthlyPayment);
    }

    $denominator = $monthlyPayment - $balance * $monthlyInterest;
    if ($denominator <= 0) return 0;

    $n = log($monthlyPayment / $denominator) / log(1 + $monthlyInterest);
    return max(0, ceil($n));
}

$goals = $conn->query("SELECT ID, CurrentBalance, InterestRate, EstMonthlyPmt FROM goals");

while ($g = $goals->fetch_assoc()) {
    $id = $g['ID'];
    $balance = (float) $g['CurrentBalance'];
    $rate = (float) $g['InterestRate'];
    $monthly = (float) $g['EstMonthlyPmt'];

    // Calculate payoff time
    $months = calculatePayoffTime($balance, $monthly, $rate);
    $years = round($months / 12, 2);

    // Calculate total interest paid
    $totalPaid = $monthly * $months;
    $interestPaid = $totalPaid - $balance;
    if ($interestPaid < 0) $interestPaid = 0;

    // Update the record
    $stmt = $conn->prepare("UPDATE goals SET PayOffTime = ?, PayOffTimeYrs = ?, TotalInterestPaid = ? WHERE ID = ?");
    $stmt->bind_param("dddi", $months, $years, $interestPaid, $id);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>
