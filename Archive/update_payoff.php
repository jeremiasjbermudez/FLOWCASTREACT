<?php
// Suppress all output and warnings
ini_set('display_errors', 0);
error_reporting(0);

// DB connection
$host = 'localhost';
$db = 'PNCaccounts';
$user = 'admin';
$pass = 'ti@A4pnc';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
} catch (PDOException $e) {
    // Silent fail
    exit;
}

// Fetch only rows flagged for recalculation
$sql = "SELECT ID, CurrentBalance, EstMonthlyPmt, InterestRate 
        FROM goals 
        WHERE NeedsRecalc = 1";
$stmt = $pdo->query($sql);

// Prepare update
$update = $pdo->prepare("UPDATE goals SET PayOffTime = :payoffTime, NeedsRecalc = 0 WHERE ID = :goalId");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $id = $row['ID'];
    $balance = floatval($row['CurrentBalance']);
    $payment = floatval($row['EstMonthlyPmt']);
    $rate = floatval($row['InterestRate']);
    $monthlyRate = ($rate * 0.001) / 12;

    $months = null;

    if ($payment > 0 && $balance > 0) {
        if ($monthlyRate > 0 && $payment <= $balance * $monthlyRate) {
            $months = null;
        } elseif ($monthlyRate == 0) {
            $months = ceil($balance / $payment);
        } else {
            $n = log(1 - ($monthlyRate * $balance) / $payment) / log(1 + $monthlyRate);
            $months = ceil(-$n);
        }
    } elseif ($balance <= 0) {
        $months = 0;
    }

    $update->execute([
        ':payoffTime' => $months,
        ':goalId' => $id
    ]);
}
?>
