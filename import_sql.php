<?php
$host = 'shinkansen.proxy.rlwy.net';
$port = 20691;
$user = 'root';
$password = 'sdTtwdpIHJXSNzQjAkxNmNwqQweEWxkq';
$dbname = 'railway';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['sqlfile'])) {
    $conn = new mysqli($host, $user, $password, $dbname, $port);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = file_get_contents($_FILES['sqlfile']['tmp_name']);
    if ($conn->multi_query($sql)) {
        echo "<p>✅ SQL file imported successfully!</p>";
    } else {
        echo "<p>❌ Error importing: " . $conn->error . "</p>";
    }

    $conn->close();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Upload SQL to Railway</title>
</head>
<body>
    <h2>Upload .sql file to import into Railway MySQL</h2>
    <form method="post" enctype="multipart/form-data">
        <input type="file" name="sqlfile" accept=".sql" required>
        <button type="submit">Upload & Import</button>
    </form>
</body>
</html>
