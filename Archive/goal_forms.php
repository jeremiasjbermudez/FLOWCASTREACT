<!-- Add Goal Form -->
<form id="goalForm" method="POST" action="goal_action.php">
  <div class="row g-2 mb-4">
    <div class="col-md-4"><input type="text" name="name" class="form-control" placeholder="Name" required></div>
    <div class="col-md-4"><input type="text" name="description" class="form-control" placeholder="Description"></div>
    <div class="col-md-2"><input type="text" name="category" class="form-control" placeholder="Category"></div>
    <div class="col-md-2 d-grid">
      <button type="submit" class="btn btn-success">Add Goal</button>
    </div>
  </div>
</form>

<!-- Withdraw Form -->
<form method="post" action="goal_action.php" class="mb-4">
  <input type="hidden" name="type" value="Withdraw">
  <div class="row g-2 align-items-end">
    <div class="col-md-3">
      <label class="form-label">Goal</label>
      <select name="goal" class="form-control" required>
        <?php
        $withdrawGoals = $conn->query("SELECT Name FROM goals");
        while ($row = $withdrawGoals->fetch_assoc()) {
            echo "<option value='{$row['Name']}'>{$row['Name']}</option>";
        }
        ?>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label">Amount</label>
      <input type="number" name="amount" step="0.01" class="form-control" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Paydate</label>
      <input type="date" name="paydate" class="form-control" required>
    </div>
    <div class="col-md-3">
      <label class="form-label">Description</label>
      <input type="text" name="description" class="form-control" placeholder="Optional note">
    </div>
    <div class="col-md-2 d-grid">
      <label class="form-label">&nbsp;</label>
      <button type="submit" class="btn btn-danger">Withdraw</button>
    </div>
  </div>
</form>

<!-- Deposit Form -->
<form method="post" action="goal_action.php" class="mb-4">
  <input type="hidden" name="type" value="Deposit">
  <div class="row g-2 align-items-end">
    <div class="col-md-3">
      <label class="form-label">Goal</label>
      <select name="goal" class="form-control" required>
        <?php
        $depositGoals = $conn->query("SELECT Name FROM goals");
        while ($row = $depositGoals->fetch_assoc()) {
            echo "<option value='{$row['Name']}'>{$row['Name']}</option>";
        }
        ?>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label">Amount</label>
      <input type="number" name="amount" step="0.01" class="form-control" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Paydate</label>
      <input type="date" name="paydate" class="form-control" required>
    </div>
    <div class="col-md-3">
      <label class="form-label">Description</label>
      <input type="text" name="description" class="form-control" placeholder="Optional note">
    </div>
    <div class="col-md-2 d-grid">
      <label class="form-label">&nbsp;</label>
      <button type="submit" class="btn btn-success">Deposit</button>
    </div>
  </div>
</form>
