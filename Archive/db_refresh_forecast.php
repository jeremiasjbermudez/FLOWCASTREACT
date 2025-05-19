<?php
// db_refresh_forecast.php

// 1. Connect
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 2. Truncate the existing forecast
if (!$conn->query("TRUNCATE TABLE `Forecast`;")) {
    die("Error truncating Forecast: " . $conn->error);
}

// 3. Build and run the multi‑source INSERT
$sql = "
INSERT INTO `Forecast` (`Date`, `Description`, `Withdrawals`, `Deposits`, `Balance`, `Account`)
SELECT 
    b.DayOfMonth AS `Date`,
    b.Bill AS `Description`,
    b.Amount AS `Withdrawals`,
    NULL AS `Deposits`,
    -b.Amount AS `Balance`,
    b.Account AS `Account`
  FROM `Bills` b
UNION ALL
SELECT
    e.DateAdded AS `Date`,
    e.Bill AS `Description`,
    e.Amount AS `Withdrawals`,
    NULL AS `Deposits`,
    -e.Amount AS `Balance`,
    e.Account AS `Account`
  FROM `Expenses` e
UNION ALL
SELECT
    d.DateAdded AS `Date`,
    d.Bill AS `Description`,
    NULL AS `Withdrawals`,
    d.Amount AS `Deposits`,
    d.Amount AS `Balance`,
    d.Account AS `Account`
  FROM `Deposits` d
UNION ALL
SELECT
    s.`Date` AS `Date`,
    s.Description AS `Description`,
    s.Withdrawals AS `Withdrawals`,
    s.Deposits AS `Deposits`,
    s.Balance AS `Balance`,
    'spending' AS `Account`
  FROM `Spending` s
UNION ALL
SELECT
    r.`Date` AS `Date`,
    r.Description AS `Description`,
    r.Withdrawals AS `Withdrawals`,
    r.Deposits AS `Deposits`,
    r.Balance AS `Balance`,
    'reserve' AS `Account`
  FROM `Reserve` r
UNION ALL
SELECT
    g.`Date` AS `Date`,
    g.Description AS `Description`,
    g.Withdrawals AS `Withdrawals`,
    g.Deposits AS `Deposits`,
    g.Balance AS `Balance`,
    'growth' AS `Account`
  FROM `Growth` g
";


// Execute query
if (!$conn->multi_query($sql)) {
    die("Error inserting into Forecast: " . $conn->error);
}

// Drain extra results if needed
do {} while ($conn->more_results() && $conn->next_result());

// Success!
echo "Forecast table refreshed successfully.";
$conn->close();
?>
