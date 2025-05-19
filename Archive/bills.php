<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

$minDateRes = $conn->query("SELECT MIN(DayOfMonth) AS earliest FROM Bills");
$earliest = $minDateRes && $minDateRes->num_rows ? $minDateRes->fetch_assoc()['earliest'] : date('Y-m-01');
$today = date('Y-m-d');
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bills Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #f0f4f8; padding: 20px; font-family: 'Segoe UI', sans-serif; }
    .header { background: linear-gradient(90deg, #2c3e50, #34495e); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 2rem; }
    #billsContainer .edit-btn, #billsContainer .save-btn, #billsContainer .delete-btn {
      margin-right: 4px;
    }
    .table-spending thead {
  background-color: #d6eaf8; /* pastel blue */
}

.table-reserve thead {
  background-color: #d5f5e3; /* pastel green */
}

.table-growth thead {
  background-color: #fcf3cf; /* pastel yellow */
}

  </style>
</head>
<body>
<div class="header d-flex flex-wrap justify-content-between align-items-center">
    <h4>🧾Bills Dashboard</h4>

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
      <div class="search-bar ms-2">
        <input type="text" id="searchInput" class="form-control" placeholder="Search bills.">
      </div>
    </div>
  </div>
  <div class="mb-3">
    <h5 class="mb-2">📅 Filter Bills by Date Range:</h5>
    <div class="controls d-flex gap-2">
      <input type="date" id="startDate" class="form-control" value="<?= $earliest ?>">
      <input type="date" id="endDate" class="form-control" value="<?= $today ?>">
    </div>
  </div>

  <div class="container text-start">
    <h2 class="mb-4">Add Bill</h2>
    <form method="POST" action="add_bill_post.php" class="row g-2 mb-4">
      <div class="col-sm-2"><input name="Bill" type="text" class="form-control" placeholder="Bill Name" required></div>
      <div class="col-sm-2"><input name="Amount" type="number" step="0.01" class="form-control" placeholder="Amount" required></div>
      <div class="col-sm-2">
        <select name="Account" class="form-select">
          <option value="spending">Spending</option>
          <option value="reserve">Reserve</option>
          <option value="growth">Growth</option>
        </select>
      </div>
      <div class="col-sm-3">
        <div id="date-container">
          <input name="DayOfMonth[]" type="date" class="form-control mb-2" required>
        </div>
        <button type="button" id="addDateBtn" class="btn btn-outline-secondary btn-sm mt-2">+ Add Date</button>
      </div>
      <div class="col-sm-2"><input name="ContainsText" type="text" class="form-control" placeholder="ContainsText"></div>
      <div class="col-sm-1">
        <button type="submit" class="btn btn-primary w-100">Add</button>
      </div>
    </form>
  </div>

  <div id="billsContainer"></div>

  <script>
    function loadBills() {
      const start = document.getElementById('startDate').value;
      const end = document.getElementById('endDate').value;
      const q = document.getElementById('searchInput').value;
      const query = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&q=${encodeURIComponent(q)}`;

      fetch(`fetch_bills_1.php?${query}`)
        .then(res => res.text())
        .then(html => {
          document.getElementById('billsContainer').innerHTML = html;
          bindBillActions();
        });
    }

    function bindBillActions() {
      document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {
          const tr = btn.closest("tr");
          tr.querySelectorAll("td").forEach(td => {
            if (["Bill", "Amount", "DayOfMonth", "ContainsText"].includes(td.className)) {
              const val = td.textContent.trim();
              td.innerHTML = `<input class='form-control form-control-sm' value="${val}" name="${td.className}">`;
            }
          });
          tr.querySelector("select").disabled = false;
          tr.querySelector(".edit-btn").classList.add("d-none");
          tr.querySelector(".save-btn").classList.remove("d-none");
        };
      });

      document.querySelectorAll(".save-btn").forEach(btn => {
        btn.onclick = () => {
          const tr = btn.closest("tr");
          const id = tr.dataset.id;
          const Bill = tr.querySelector("input[name='Bill']").value;
          const Amount = tr.querySelector("input[name='Amount']").value;
          const DayOfMonth = tr.querySelector("input[name='DayOfMonth']").value;
          const Account = tr.querySelector("select").value;
          const ContainsText = tr.querySelector("input[name='ContainsText']").value;

          const body = new URLSearchParams({ id, Bill, Amount, DayOfMonth, Account, ContainsText });

          fetch("api/update_bill.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
          }).then(r => r.json()).then(resp => {
            if (resp.status === "success") loadBills();
            else alert("Update failed: " + resp.message);
          });
        };
      });

      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
          const tr = btn.closest("tr");
          const id = tr.dataset.id;
          if (confirm("Delete this bill?")) {
            fetch("api/delete_bill.php", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `id=${id}`
            }).then(r => r.json()).then(resp => {
              if (resp.status === "success") tr.remove();
              else alert("Delete failed: " + resp.message);
            });
          }
        };
      });
    }

    function getMonthBounds() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      return { start, end };
    }

    function resetToMonth() {
      const { start, end } = getMonthBounds();
      document.getElementById('startDate').value = start;
      document.getElementById('endDate').value = end;
      document.getElementById('searchInput').value = '';
      loadBills();
    }

    function manualSync() {
      fetch('sync_paid_dates.php')
        .then(r => r.text())
        .then(msg => alert(msg));
    }

    document.getElementById('startDate').addEventListener('change', loadBills);
    document.getElementById('endDate').addEventListener('change', loadBills);
    document.getElementById('searchInput').addEventListener('input', loadBills);
    document.getElementById('addDateBtn').addEventListener('click', () => {
      const container = document.getElementById('date-container');
      const input = document.createElement('input');
      input.name = 'DayOfMonth[]';
      input.type = 'date';
      input.className = 'form-control mb-2';
      container.appendChild(input);
    });

    window.addEventListener('DOMContentLoaded', () => {
      resetToMonth();
      fetch('sync_paid_dates.php')
        .then(r => r.text())
        .then(msg => console.log('[Auto Sync]', msg));
    });
  </script>
</body>
</html>
