// goal_action.php (add support for new goals, deposits, and withdrawals)
<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST['name'])) {
        // Add Goal
        $name = $conn->real_escape_string($_POST['name']);
        $desc = $conn->real_escape_string($_POST['description']);
        $cat  = $conn->real_escape_string($_POST['category']);
        $balance = isset($_POST['CurrentBalance']) ? floatval($_POST['CurrentBalance']) : 0;
        $interest = isset($_POST['InterestRate']) ? floatval($_POST['InterestRate']) : 0;
        $monthly = isset($_POST['EstMonthlyPmt']) ? floatval($_POST['EstMonthlyPmt']) : 0;
        // Calculate payoff time and total interest
        function calculatePayoffTime($balance, $monthlyPayment, $annualInterest) {
            if ($monthlyPayment <= 0 || $balance <= 0) return null; // impossible
            $monthlyInterest = $annualInterest / 100 / 12;
            if ($monthlyInterest == 0) {
                return ceil($balance / $monthlyPayment);
            }
            $denominator = $monthlyPayment - $balance * $monthlyInterest;
            if ($denominator <= 0) return null; // impossible to pay off
            $n = log($monthlyPayment / $denominator) / log(1 + $monthlyInterest);
            return max(0, ceil($n));
        }
        function calculateTotalInterest($balance, $monthlyPayment, $annualInterest) {
            if ($monthlyPayment <= 0 || $balance <= 0) return null;
            $monthlyInterest = $annualInterest / 100 / 12;
            $totalInterest = 0;
            $currentBalance = $balance;
            $months = 0;
            while ($currentBalance > 0 && $months < 1000) {
                $interest = $currentBalance * $monthlyInterest;
                $principal = $monthlyPayment - $interest;
                if ($principal <= 0) return null; // impossible to pay off
                if ($principal > $currentBalance) $principal = $currentBalance;
                $totalInterest += $interest;
                $currentBalance -= $principal;
                $months++;
            }
            return round($totalInterest, 2);
        }
        $payOffTime = calculatePayoffTime($balance, $monthly, $interest);
        $payOffTimeYrs = is_null($payOffTime) ? null : round($payOffTime / 12, 2);
        $totalInterestPaid = calculateTotalInterest($balance, $monthly, $interest);

        // Prepare values for SQL (NULL if impossible)
        $payOffTime_sql = is_null($payOffTime) ? 'NULL' : $payOffTime;
        $payOffTimeYrs_sql = is_null($payOffTimeYrs) ? 'NULL' : $payOffTimeYrs;
        $totalInterestPaid_sql = is_null($totalInterestPaid) ? 'NULL' : $totalInterestPaid;

        $conn->query("INSERT INTO goals (Name, Description, Category, CurrentBalance, InterestRate, EstMonthlyPmt, PayOffTime, PayOffTimeYrs, TotalInterestPaid) VALUES ('$name', '$desc', '$cat', $balance, $interest, $monthly, $payOffTime_sql, $payOffTimeYrs_sql, $totalInterestPaid_sql)");
        header("Location: goals.php");
        exit;
    } elseif (isset($_POST['type']) && in_array($_POST['type'], ['Deposit', 'Withdraw'])) {
        // Add Deposit or Withdraw
        $type = $_POST['type'];
        $goal = $conn->real_escape_string($_POST['goal']);
        $amt = floatval($_POST['amount']);
        $date = $conn->real_escape_string($_POST['paydate']);
        $desc = $conn->real_escape_string($_POST['description']);

        $conn->query("INSERT INTO goalswd (Goal, Type, Amount, PayDate, Description) VALUES ('$goal', '$type', $amt, '$date', '$desc')");
        if ($type === 'Deposit') {
            $conn->query("UPDATE goals SET Deposits = Deposits + $amt, TotalDCount = TotalDCount + 1, CurrentBalance = CurrentBalance + $amt WHERE Name = '$goal'");
        } else {
            $conn->query("UPDATE goals SET Withdraws = Withdraws + $amt, TotalWCount = TotalWCount + 1, CurrentBalance = CurrentBalance - $amt WHERE Name = '$goal'");
        }
        header("Location: goals.php");
        exit;
    }
}
?>
