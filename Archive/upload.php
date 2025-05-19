<?php
$servername = "localhost";
$username = "admin";
$password = "ti@A4pnc"; // Change if needed
$dbname = "PNCaccounts";

// Connect to MySQL
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function cleanMoney($value) {
    $value = str_replace(['$', ',', ' '], '', $value);
    return $value !== '' ? floatval($value) : NULL;
}

function cleanDate($dateStr) {
    return date('Y-m-d', strtotime($dateStr));
}

function rowExists($conn, $table, $date, $description, $amountColumn, $amountValue) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM `$table` WHERE `Date` = ? AND `Description` = ? AND `$amountColumn` = ?");
    $stmt->bind_param("ssd", $date, $description, $amountValue);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    return $count > 0;
}

function importCSV($conn, $csvFile, $tableName) {
    if (!file_exists($csvFile)) {
        echo "File $csvFile not found.<br>";
        return;
    }

    $file = fopen($csvFile, "r");
    if (!$file) {
        echo "Failed to open $csvFile.<br>";
        return;
    }

    // Skip headers
    fgetcsv($file);
    $newRecords = 0;

    while (($row = fgetcsv($file)) !== FALSE) {
        if ($tableName == 'Spending') {
            list($date, $description, $withdrawals, $deposits, $category, $balance) = $row;

            $date = cleanDate($date);
            $description = $conn->real_escape_string($description);
            $withdrawals = cleanMoney($withdrawals);
            $deposits = cleanMoney($deposits);
            $category = $conn->real_escape_string($category);
            $balance = cleanMoney($balance);

            $mainAmount = $deposits !== NULL ? $deposits : $withdrawals;
            $amountColumn = $deposits !== NULL ? "Deposits" : "Withdrawals";

            if (!rowExists($conn, $tableName, $date, $description, $amountColumn, $mainAmount)) {
                $sql = "INSERT INTO Spending (Date, Description, Withdrawals, Deposits, Category, Balance)
                        VALUES ('$date', '$description', " . 
                        ($withdrawals !== NULL ? $withdrawals : "NULL") . ", " .
                        ($deposits !== NULL ? $deposits : "NULL") . ", 
                        '$category', " .
                        ($balance !== NULL ? $balance : "NULL") . ")";
                if ($conn->query($sql)) {
                    $newRecords++;
                } else {
                    echo "Error inserting into $tableName: " . $conn->error . "<br>";
                }
            }
        } else {
            // Reserve and Growth tables
            list($date, $description, $withdrawals, $deposits, $balance) = $row;

            $date = cleanDate($date);
            $description = $conn->real_escape_string($description);
            $withdrawals = cleanMoney($withdrawals);
            $deposits = cleanMoney($deposits);
            $balance = cleanMoney($balance);

            $mainAmount = $deposits !== NULL ? $deposits : $withdrawals;
            $amountColumn = $deposits !== NULL ? "Deposits" : "Withdrawals";

            if (!rowExists($conn, $tableName, $date, $description, $amountColumn, $mainAmount)) {
                $sql = "INSERT INTO `$tableName` (Date, Description, Withdrawals, Deposits, Balance)
                        VALUES ('$date', '$description', " .
                        ($withdrawals !== NULL ? $withdrawals : "NULL") . ", " .
                        ($deposits !== NULL ? $deposits : "NULL") . ", " .
                        ($balance !== NULL ? $balance : "NULL") . ")";
                if ($conn->query($sql)) {
                    $newRecords++;
                } else {
                    echo "Error inserting into $tableName: " . $conn->error . "<br>";
                }
            }
        }
    }

    fclose($file);
    echo "Imported $newRecords new rows into $tableName.<br>";
}

function importBillsCSV($conn, $csvFile) {
    if (!file_exists($csvFile)) {
        echo "File $csvFile not found.<br>";
        return;
    }

    $file = fopen($csvFile, "r");
    if (!$file) {
        echo "Failed to open $csvFile.<br>";
        return;
    }

    // Skip headers
    fgetcsv($file);
    $newRecords = 0;

    while (($row = fgetcsv($file)) !== FALSE) {
        list($bill, $dayOfMonth, $amount, $containsText, $account) = $row;

        $bill = $conn->real_escape_string(trim($bill));
        $dayOfMonth = intval($dayOfMonth);
        $amount = cleanMoney($amount);
        $containsText = $conn->real_escape_string(trim($containsText));
        $account = $conn->real_escape_string(trim($account));

        // Check for duplicate (optional: based on Bill name and DayOfMonth)
        $stmt = $conn->prepare("SELECT COUNT(*) FROM Bills WHERE Bill = ? AND DayOfMonth = ?");
        $stmt->bind_param("si", $bill, $dayOfMonth);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count == 0) {
            $sql = "INSERT INTO Bills (Bill, DayOfMonth, Amount, ContainsText, Account)
                    VALUES ('$bill', $dayOfMonth, $amount, '$containsText', '$account')";
            if ($conn->query($sql)) {
                $newRecords++;
            } else {
                echo "Error inserting into Bills: " . $conn->error . "<br>";
            }
        }
    }

    fclose($file);
    echo "Imported $newRecords new rows into Bills.<br>";
}

$csvFolder = __DIR__ . "/csv/";

importCSV($conn, $csvFolder . "spending.csv", "Spending");
importCSV($conn, $csvFolder . "reserve.csv", "Reserve");
importCSV($conn, $csvFolder . "growth.csv", "Growth");
importBillsCSV($conn, $csvFolder . "bills.csv");

$conn->close();
?>
