<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Handle delete
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['completed'])) {
    foreach ($_POST['completed'] as $id) {
        $id = intval($id);
        $conn->query("DELETE FROM Todo WHERE id = $id");
    }
}

// Handle add
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['add'])) {
    $stmt = $conn->prepare("INSERT INTO Todo (name, due_date, cost, description, notes) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdss", $_POST['name'], $_POST['due_date'], $_POST['cost'], $_POST['description'], $_POST['notes']);
    $stmt->execute();
}

// Handle update
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_id'])) {
    $stmt = $conn->prepare("UPDATE Todo SET name=?, due_date=?, cost=?, description=?, notes=? WHERE id=?");
    $stmt->bind_param("ssdssi", $_POST['name'], $_POST['due_date'], $_POST['cost'], $_POST['description'], $_POST['notes'], $_POST['update_id']);
    $stmt->execute();
}

$result = $conn->query("SELECT * FROM Todo ORDER BY due_date ASC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>To Do Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f0f4f8;
            padding: 20px;
            font-family: 'Segoe UI', sans-serif;
        }
        .header {
            background: linear-gradient(90deg, #2c3e50, #34495e);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
<div class="container-fluid">
    <div class="header d-flex justify-content-between align-items-center">
        <h2 class="mb-0">📝 To Do Dashboard</h2>
        <div class="d-flex align-items-center gap-2">
        <a href="calendar.php" class="btn btn-outline-info btn-sm">📅 Calendar</a>
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

    <!-- Add New To Do -->
    <form method="POST" class="mb-4">
        <input type="hidden" name="add" value="1">
        <div class="row g-2">
            <div class="col-md-2"><input name="name" class="form-control" placeholder="Task Name" required></div>
            <div class="col-md-2"><input name="due_date" type="date" class="form-control" required></div>
            <div class="col-md-1"><input name="cost" type="number" step="0.01" class="form-control" placeholder="Cost"></div>
            <div class="col-md-3"><input name="description" class="form-control" placeholder="Description"></div>
            <div class="col-md-3"><input name="notes" class="form-control" placeholder="Notes"></div>
            <div class="col-md-1 d-grid"><button class="btn btn-success">Add</button></div>
        </div>
    </form>

    <!-- Table -->
    <form method="POST">
        <table class="table table-bordered table-hover bg-white">
            <thead class="table-secondary">
                <tr>
                    <th>Done</th>
                    <th>Name</th>
                    <th>Due Date</th>
                    <th>Cost</th>
                    <th>Description</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = $result->fetch_assoc()): ?>
                    <?php if (isset($_GET['edit']) && $_GET['edit'] == $row['id']): ?>
                        <!-- Edit Mode -->
                        <tr>
                            <form method="POST">
                                <input type="hidden" name="update_id" value="<?= $row['id'] ?>">
                                <td></td>
                                <td><input name="name" class="form-control" value="<?= htmlspecialchars($row['name']) ?>"></td>
                                <td><input name="due_date" type="date" class="form-control" value="<?= $row['due_date'] ?>"></td>
                                <td><input name="cost" type="number" step="0.01" class="form-control" value="<?= $row['cost'] ?>"></td>
                                <td><input name="description" class="form-control" value="<?= htmlspecialchars($row['description']) ?>"></td>
                                <td><input name="notes" class="form-control" value="<?= htmlspecialchars($row['notes']) ?>"></td>
                                <td class="d-grid gap-2">
                                    <button class="btn btn-primary btn-sm">Save</button>
                                    <a href="todo.php" class="btn btn-secondary btn-sm">Cancel</a>
                                </td>
                            </form>
                        </tr>
                    <?php else: ?>
                        <!-- Display Mode -->
                        <tr>
                            <td class="text-center">
                                <input type="checkbox" name="completed[]" value="<?= $row['id'] ?>" onchange="this.form.submit()">
                            </td>
                            <td><?= htmlspecialchars($row['name']) ?></td>
                            <td><?= htmlspecialchars($row['due_date']) ?></td>
                            <td>$<?= number_format($row['cost'], 2) ?></td>
                            <td><?= htmlspecialchars($row['description']) ?></td>
                            <td><?= htmlspecialchars($row['notes']) ?></td>
                            <td class="text-center">
                                <a href="?edit=<?= $row['id'] ?>" class="btn btn-sm btn-warning">Edit</a>
                            </td>
                        </tr>
                    <?php endif; ?>
                <?php endwhile; ?>
            </tbody>
        </table>
    </form>
</div>
</body>
</html>
