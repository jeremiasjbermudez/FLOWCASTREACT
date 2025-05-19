<?php
// goals.php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB error: " . $conn->connect_error);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Goals Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #f0f4f8; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    .header {
      background: linear-gradient(90deg, #2c3e50, #34495e);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .header h1 {
      margin: 0;
      font-size: 2rem;
    }
    .searchInput input {
      border-radius: 10px;
      padding: 0.5rem 1rem;
    }
    .table-wrapper { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .form-control, .btn { border-radius: 10px; }
    td[contenteditable="true"]:focus { outline: 2px solid #3498db; background: #ecf0f1; }
    tfoot td { font-weight: bold; background: #f9f9f9; }
    .edit-btn, .save-btn, .cancel-btn { cursor: pointer; }
  </style>
</head>
<body>
  <div class="header d-flex flex-wrap justify-content-between align-items-center">
    <h1 class="mb-0">⚽ Goals Dashboard</h1>
    <div class="d-flex align-items-center gap-2">
      <a href="calendar.php" class="btn btn-outline-info btn-sm">📅 Calendar</a>
      <a href="update_tables.php" class="btn btn-outline-info btn-sm">🔮 Update Accounts</a>
      <a href="bills.php" class="btn btn-outline-info btn-sm">💸 Bills</a>
      <a href="expenses.php" class="btn btn-outline-info btn-sm">💸 Expenses</a>
      <a href="deposits.php" class="btn btn-outline-info btn-sm">💰 Deposits</a>
      <a href="bills_paid.php" class="btn btn-outline-info btn-sm">📄 Bills Paid</a>
      <a href="forecast.php" class="btn btn-outline-info btn-sm">🔮 Forecast</a>
      <a href="goals.php" class="btn btn-outline-info btn-sm">⚽ Goals</a>
      <a href="index.php" class="btn btn-outline-info btn-sm">🏠 Back to Dashboard</a>
    </div>
  </div>

  <div class="table-wrapper">
    <form id="goalForm" method="POST">
      <div class="row g-2 mb-4">
        <div class="col-md-4"><input type="text" name="name" class="form-control" placeholder="Name" required></div>
        <div class="col-md-4"><input type="text" name="description" class="form-control" placeholder="Description"></div>
        <div class="col-md-2"><input type="text" name="category" class="form-control" placeholder="Category"></div>
        <div class="col-md-2 d-grid">
          <button type="submit" class="btn btn-success">Add Goal</button>
        </div>
      </div>
    </form>

    <div id="goalsTable"></div>
  </div>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script>
    // Load goals based on search
    function loadGoals(query = '') {
      $.get("fetch_goals.php", { q: query }, function(data) {
        $('#goalsTable').html(data);
        calculateTotal();
      });
    }

    // Calculate total balance
    function calculateTotal() {
      let total = 0;
      $('#goalsTable table tbody tr').each(function () {
        const val = parseFloat($(this).find('td[data-field="CurrentBalance"]').text());
        if (!isNaN(val)) total += val;
      });
      if ($('#goalsTable table tfoot').length === 0) {
        $('#goalsTable table').append('<tfoot><tr><td colspan="100%">Total Balance: $<span id="totalVal"></span></td></tr></tfoot>');
      }
      $('#totalVal').text(total.toFixed(2));
    }

    // Search goals as user types
    $('#searchInput').on('keyup', function () {
      loadGoals(this.value);
    });

    // Add goal to database
    $('#goalForm').on('submit', function (e) {
      e.preventDefault();
      $.post('add_goal.php', $(this).serialize(), function () {
        loadGoals();
        $('#goalForm')[0].reset();
      });
    });

    // Update goal in the database
    function updateGoal(id, field, value) {
      $.post('update_goal.php', { id, field, value });
    }

    // Delete goal from the database
    function deleteGoal(id) {
      if (confirm("Delete this goal?")) {
        $.post('delete_goal.php', { id }, function () {
          loadGoals();
        });
      }
    }

    // Enable inline editing when Edit button is clicked
    $(document).on('click', '.edit-btn', function () {
      var row = $(this).closest('tr');
      row.find('td').each(function() {
        $(this).attr('contenteditable', 'true').focus();
      });
      $(this).hide();  // Hide Edit button after clicking
      row.find('.save-btn').show();  // Show the Save button
      row.find('.cancel-btn').show();  // Show the Cancel button
    });

    // Save changes when Save button is clicked
    $(document).on('click', '.save-btn', function () {
      var row = $(this).closest('tr');
      var id = row.data('id');
      var updatedData = {};
      row.find('td[contenteditable="true"]').each(function() {
        var field = $(this).data('field');
        updatedData[field] = $(this).text();
        $(this).attr('contenteditable', 'false');  // Disable editing after save
      });
      $.post('update_goal.php', { id: id, data: updatedData }, function() {
        loadGoals();  // Reload goals to reflect the changes
      });
      $(this).hide();  // Hide save button after saving
      row.find('.edit-btn').show();  // Show the Edit button again
      row.find('.cancel-btn').hide();  // Hide the Cancel button
    });

    // Cancel editing and revert to original values
    $(document).on('click', '.cancel-btn', function () {
      var row = $(this).closest('tr');
      row.find('td[contenteditable="true"]').each(function() {
        var originalValue = $(this).data('original-value');
        $(this).text(originalValue);  // Revert to the original value
        $(this).attr('contenteditable', 'false');  // Disable editing
      });
      $(this).hide();  // Hide Cancel button after cancelling
      row.find('.edit-btn').show();  // Show the Edit button again
      row.find('.save-btn').hide();  // Hide the Save button
    });

    // Initial load of goals
    loadGoals();
  </script>
</body>
</html>
