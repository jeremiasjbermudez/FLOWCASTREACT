<?php
$mysqli = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$tables = ['Spending', 'Reserve', 'Growth'];
$columns = ['Date', 'Description', 'Withdrawals', 'Deposits', 'Balance'];
$colList = implode(', ', $columns);
$orderCols = implode(', ', array_map(fn($c) => "`$c`", $columns));

foreach ($tables as $table) {
    echo "Processing $table...\n";

    // Step 1: Create temporary table with row numbers
    $tempTable = "{$table}_deduped";
    $mysqli->query("DROP TEMPORARY TABLE IF EXISTS `$tempTable`");

    $createSql = "
        CREATE TEMPORARY TABLE `$tempTable` AS
        SELECT *, 
               ROW_NUMBER() OVER (PARTITION BY $colList ORDER BY $colList) as row_num
        FROM `$table`
    ";
    if (!$mysqli->query($createSql)) {
        die("Failed to create temp table for $table: " . $mysqli->error);
    }

    // Step 2: Delete all data from the original table
    if (!$mysqli->query("DELETE FROM `$table`")) {
        die("Failed to clear $table: " . $mysqli->error);
    }

    // Step 3: Re-insert only the first occurrences (row_num = 1)
    $insertSql = "
        INSERT INTO `$table` ($colList)
        SELECT $colList FROM `$tempTable` WHERE row_num = 1
    ";
    if ($mysqli->query($insertSql)) {
        echo "Duplicates removed from $table.\n";
    } else {
        echo "Error reinserting into $table: " . $mysqli->error . "\n";
    }
}

$mysqli->close();
?>
