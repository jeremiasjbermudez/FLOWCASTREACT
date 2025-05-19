<?php
$mysqli = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Columns to check for duplicates
$columns = ['Date', 'Description', 'Withdrawals', 'Deposits', 'Balance', 'Name', 'Category'];
$colList = implode(', ', $columns);

// Step 1: Create a temporary deduplicated table with row numbers
$tempTable = "habits_deduped";
$mysqli->query("DROP TEMPORARY TABLE IF EXISTS `$tempTable`");

$createTempSql = "
    CREATE TEMPORARY TABLE `$tempTable` AS
    SELECT *, 
           ROW_NUMBER() OVER (PARTITION BY $colList ORDER BY $colList) as row_num
    FROM `habits`
";
if (!$mysqli->query($createTempSql)) {
    die("Error creating temp table: " . $mysqli->error);
}

// Step 2: Clear the original habits table
if (!$mysqli->query("DELETE FROM `habits`")) {
    die("Error clearing habits table: " . $mysqli->error);
}

// Step 3: Reinsert only unique entries (row_num = 1)
$insertBackSql = "
    INSERT INTO `habits` ($colList)
    SELECT $colList FROM `$tempTable` WHERE row_num = 1
";
if ($mysqli->query($insertBackSql)) {
    echo "Duplicates removed successfully from habits table.\n";
} else {
    echo "Error reinserting data: " . $mysqli->error;
}

$mysqli->close();
?>
