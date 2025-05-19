<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// --- DEFAULT DATE FILTER LOGIC ---
$defaultStart = '';
$payrollResult = $conn->query("SELECT Date FROM reserve WHERE Description LIKE '%5737 PAYROLL%' AND Date <= CURDATE() ORDER BY Date DESC LIMIT 1");
if ($payrollResult && $row = $payrollResult->fetch_assoc()) {
    $defaultStart = $row['Date'];
}
$today = (int)date('d');
$defaultEnd = ($today >= 16) ? date('Y-m-30') : date('Y-m-15');
$start = isset($_GET['start']) ? $_GET['start'] : $defaultStart;
$end   = isset($_GET['end'])   ? $_GET['end']   : $defaultEnd;

// Handle delete
if (isset($_GET['delete_category'])) {
    $categoryToDelete = $conn->real_escape_string($_GET['delete_category']);
    $conn->query("DELETE FROM habits WHERE Category = '$categoryToDelete'");
}
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM habits WHERE id = $id");
}

// Handle update
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_id'])) {
    $stmt = $conn->prepare("UPDATE habits SET Date = ?, Description = ?, Withdrawals = ?, Deposits = ?, Balance = ?, Name = ?, Category = ? WHERE id = ?");
    $stmt->bind_param("ssddsssi", $_POST['Date'], $_POST['Description'], $_POST['Withdrawals'], $_POST['Deposits'], $_POST['Balance'], $_POST['Name'], $_POST['Category'], $_POST['update_id']);
    $stmt->execute();
}

// Handle habit form submission
if ($_SERVER["REQUEST_METHOD"] == "POST" && !isset($_POST['update_id'])) {
    $name = $_POST['name'];
    $category = $_POST['category'];
    $tables = ['spending', 'reserve', 'growth'];
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SELECT * FROM $table WHERE Description LIKE ?");
        $like = "%$name%";
        $stmt->bind_param("s", $like);
        $stmt->execute();
        $results = $stmt->get_result();
        while ($row = $results->fetch_assoc()) {
            $insert = $conn->prepare("INSERT INTO habits (Date, Description, Withdrawals, Deposits, Balance, Name, Category) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $insert->bind_param("ssddsss", $row['Date'], $row['Description'], $row['Withdrawals'], $row['Deposits'], $row['Balance'], $name, $category);
            $insert->execute();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>🎢 Habits Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f0f2f5; }
        .custom-header { background: #2c3e50; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .custom-header h4 { color: #fff; font-weight: 700; }
        .custom-header .btn { border: 1px solid #00ffff; color: #00ffff; background-color: transparent; }
        .custom-header .btn:hover { background-color: #00ffff; color: #2c3e50; }
        .modern-table thead { background-color: #0d6efd; color: white; }
        .modern-table input { background-color: #f8f9fa; border: 1px solid #ced4da; border-radius: 0.25rem; }
        .card { max-height: 520px; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); min-width: 300px; flex: 1 1 300px; }
        .card-body { overflow-y: auto; flex: 1 1 auto; }
        @media (max-width: 768px) { .card { min-width: 100% !important; } }
    </style>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('categoryFilter');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const cards = document.querySelectorAll('.card[data-category]');
    const totalOutput = document.getElementById('totalSelected');

    function updateSelection() {
        const selected = Array.from(dropdown.selectedOptions).map(o => o.value);
        let total = 0;
        cards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (selected.length === 0 || selected.includes(cat)) {
                total += parseFloat(card.getAttribute('data-total')) || 0;
            }
        });
        totalOutput.textContent = `Total Habit Expense: $${total.toFixed(2)}`;
    }

    selectAllBtn.addEventListener('click', () => {
        for (let i = 0; i < dropdown.options.length; i++) {
            dropdown.options[i].selected = true;
        }
        updateSelection();
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        for (let i = 0; i < dropdown.options.length; i++) {
            dropdown.options[i].selected = false;
        }
        updateSelection();
    });

    dropdown.addEventListener('change', updateSelection);
    updateSelection();
});
</script>


</head>
<body class="p-4">
<div class="container-fluid">
    <div class="custom-header d-flex flex-wrap justify-content-between align-items-center">
        <h4>🎢 Habits Dashboard</h4>
        <div class="d-flex flex-wrap gap-2">
            <a href="calendar.php" class="btn btn-sm">🗅️ Calendar</a>
            <a href="calendar.php" class="btn btn-outline-info btn-sm">🗕 Calendar</a>
            <a href="update_tables.php" class="btn btn-outline-info btn-sm">🔮 Update Accounts</a>
            <a href="bills.php" class="btn btn-outline-info btn-sm">💸 Bills</a>
            <a href="expenses.php" class="btn btn-outline-info btn-sm">💸 Expenses</a>
            <a href="deposits.php" class="btn btn-outline-info btn-sm">💰 Deposits</a>
            <a href="bills_paid.php" class="btn btn-outline-info btn-sm">📄 Bills Paid</a>
            <a href="forecast.php" class="btn btn-outline-info btn-sm">🔮 Forecast</a>
            <a href="goals.php" class="btn btn-outline-info btn-sm">⚽ Goals</a>
            <a href="todo.php" class="btn btn-outline-info btn-sm">📝 To Do</a>
            <a href="habits.php" class="btn btn-sm btn-outline-light border border-info">🧲 Habits</a>
            <a href="index.php" class="btn btn-outline-info btn-sm">🏠 Back to Dashboard</a>
        </div>
    </div>
</div>

<div class="container-fluid px-4">
    <div class="card mb-4 p-3">
        <h5 class="mb-2">📆 Filter Habits by Date</h5>
        <form method="GET" class="row g-2 align-items-center">
            <div class="col-md-5">
                <label class="form-label mb-1">Start Date</label>
                <input type="date" name="start" class="form-control" value="<?php echo htmlspecialchars($start); ?>">
            </div>
            <div class="col-md-5">
                <label class="form-label mb-1">End Date</label>
                <input type="date" name="end" class="form-control" value="<?php echo htmlspecialchars($end); ?>">
            </div>
            <div class="col-md-2 d-grid">
                <button type="submit" class="btn btn-primary">🔍 Filter</button>
            </div>
        </form>
    </div>

    <div class="card p-4 mb-4">
        <h5 class="mb-3">➕ Add a New Habit</h5>
        <form method="POST" class="row g-2">
            <div class="col-md-5"><input type="text" name="name" class="form-control" placeholder="Habit Name" required></div>
            <div class="col-md-5"><input type="text" name="category" class="form-control" placeholder="Category" required></div>
            <div class="col-md-2 d-grid"><button type="submit" class="btn btn-success">Add Habit</button></div>
        </form>
    </div>

    <div class="mb-3">
        <label for="categoryFilter" class="form-label">Select Habit Categories:</label>
        <select id="categoryFilter" class="form-select" multiple>
            <?php
            $allCats = $conn->query("SELECT DISTINCT Category FROM habits");
            while ($c = $allCats->fetch_assoc()) {
                echo '<option value="' . htmlspecialchars($c['Category']) . '">' . htmlspecialchars($c['Category']) . '</option>';
            }
            ?>
        </select>
        <div class="d-flex gap-2 align-items-center mb-2">
    <button id="selectAllBtn" class="btn btn-sm btn-secondary">Select All</button>
<button id="clearAllBtn" class="btn btn-sm btn-outline-secondary">Clear All</button>
</div>

        <div class="mt-2 fw-bold" id="totalSelected">Total Habit Expense: $0.00</div>
    </div>

    <div class="d-flex flex-wrap gap-3 justify-content-start">
    <?php
    $categories = $conn->query("SELECT DISTINCT Category FROM habits");
    while ($cat = $categories->fetch_assoc()) {
        $catVal = $conn->real_escape_string($cat['Category']);
        $rows = $conn->query("SELECT * FROM habits WHERE Category = '$catVal' AND Date BETWEEN '$start' AND '$end'");
        $totalWithdrawals = 0;
        $dataRows = [];

        while ($r = $rows->fetch_assoc()) {
            $dataRows[] = $r;
            $totalWithdrawals += $r['Withdrawals'];
        }

        echo '<div class="card" data-category="' . htmlspecialchars($cat['Category']) . '" data-total="' . $totalWithdrawals . '">';
        echo '<div class="card-header bg-primary text-white">';
        echo '<div class="d-flex justify-content-between align-items-center">';
        echo '<strong>' . htmlspecialchars($cat['Category']) . '</strong>';
        echo '<a href="?delete_category=' . urlencode($cat['Category']) . '" class="btn btn-sm btn-danger">🗑️</a>';
        echo '</div>';
        echo '<div class="text-end mt-1"><small>Total: $' . number_format($totalWithdrawals, 2) . '</small></div>';
        echo '</div>';
        echo '<div class="card-body">';
        echo '<div class="table-responsive">';
        echo '<table class="table table-bordered table-sm align-middle modern-table">';
        echo '<thead><tr><th>Name</th><th>Date</th><th>Withdrawals</th><th>Actions</th></tr></thead><tbody>';

        foreach ($dataRows as $r) {
            echo '<tr><form method="POST">';
            echo '<input type="hidden" name="update_id" value="' . $r['id'] . '">';
            echo '<td><input type="text" name="Name" class="form-control form-control-sm" value="' . htmlspecialchars($r['Name']) . '"></td>';
            echo '<td><input type="date" name="Date" class="form-control form-control-sm" value="' . $r['Date'] . '"></td>';
            echo '<td><input type="number" step="0.01" name="Withdrawals" class="form-control form-control-sm" value="' . $r['Withdrawals'] . '"></td>';
            echo '<td class="text-nowrap">';
            echo '<button type="submit" class="btn btn-success btn-sm me-1">💾</button>';
            echo '<a href="?delete=' . $r['id'] . '" class="btn btn-danger btn-sm">🗑️</a>';
            echo '</td>';
            echo '</form></tr>';
        }

        echo '</tbody></table></div></div></div>';
    }
    ?>
    </div>
</div>
</body>
</html>     