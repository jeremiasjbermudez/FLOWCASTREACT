<?php
// import_bills.php

$csvFile   = __DIR__ . '/bills.csv';

// try tabs first, then comma
$primaryDelim   = "\t";
$fallbackDelim  = ',';

// MySQL creds
$host   = 'localhost';
$user   = 'admin';
$pass   = 'ti@A4pnc';
$dbname = 'PNCaccounts';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function cleanMoney(string $v): float {
    return floatval(str_replace(['$', ',', ' '], '', $v));
}
function makeDateFromDay(int $d): string {
    return date('Y-m-') . str_pad($d, 2, '0', STR_PAD_LEFT);
}

if (!is_readable($csvFile) || !($h = fopen($csvFile, 'r'))) {
    die("Cannot open $csvFile\n");
}

// skip header
fgetcsv($h, 1000, $primaryDelim);

// prepare statements
$sel = $conn->prepare("SELECT id FROM Bills WHERE Bill = ?");
$ins = $conn->prepare("
  INSERT INTO Bills
    (Bill, DayOfMonth, Amount, ContainsText, Account)
  VALUES (?, ?, ?, ?, ?)
");
$upd = $conn->prepare("
  UPDATE Bills
     SET DayOfMonth   = ?,
         Amount       = ?,
         ContainsText = ?,
         Account      = ?
   WHERE id = ?
");

$inserted = $updated = 0;

while (($row = fgetcsv($h, 1000, $primaryDelim)) !== false) {
    // if we didn't get 5 columns, try comma delimiter on the raw line
    if (count($row) < 5) {
        // $row[0] is the raw line
        $row = str_getcsv($row[0], $fallbackDelim);
        if (count($row) < 5) {
            // still bad? skip it
            continue;
        }
    }

    // now we have at least 5 elements
    list($bill, $dayS, $amtS, $contains, $account) = array_map('trim', $row);

    if ($bill === '') {
        // no bill name → skip
        continue;
    }

    $day  = intval($dayS);
    $date = makeDateFromDay($day);
    $amt  = cleanMoney($amtS);

    // check existing
    $sel->bind_param('s', $bill);
    $sel->execute();
    $sel->bind_result($id);
    $sel->fetch();
    $sel->free_result();

    if ($id) {
        // update
        $upd->bind_param('sdssi', $date, $amt, $contains, $account, $id);
        $upd->execute();
        $updated++;
    } else {
        // insert
        $ins->bind_param('sssss', $bill, $date, $amt, $contains, $account);
        $ins->execute();
        $inserted++;
    }
}

fclose($h);

echo "Done: inserted $inserted rows, updated $updated rows.\n";

$sel->close();
$ins->close();
$upd->close();
$conn->close();
