<?php
$conn = new mysqli("localhost", "admin", "ti@A4pnc", "PNCaccounts");
$result = $conn->query("SELECT * FROM goals");

// Define columns to show
$fields = ['Name', 'Description', 'Category', 'CurrentBalance', 'Withdraws', 'TotalWCount', 'Deposits', 'TotalDCount', 'InterestRate', 'Documents'];
?>

<div class="table-responsive mb-4">
  <table class="table table-bordered table-striped align-middle">
    <thead class="table-dark">
      <tr>
        <th>ID</th>
        <?php foreach ($fields as $field): ?>
          <th><?= $field ?></th>
        <?php endforeach; ?>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php while ($row = $result->fetch_assoc()): ?>
        <tr data-id="<?= $row['ID'] ?>">
          <td><?= $row['ID'] ?></td>
          <?php foreach ($fields as $f): 
            $v = isset($row[$f]) ? htmlspecialchars($row[$f]) : '';
          ?>
            <td contenteditable="false" data-field="<?= $f ?>" data-original-value="<?= $v ?>"><?= $v ?></td>
          <?php endforeach; ?>
          <td>
            <button class="btn btn-sm btn-warning edit-btn">Edit</button>
            <button class="btn btn-sm btn-success save-btn" style="display:none;">Save</button>
            <button class="btn btn-sm btn-secondary cancel-btn" style="display:none;">Cancel</button>
            <button class="btn btn-sm btn-danger" onclick="deleteGoal(<?= $row['ID'] ?>)">Delete</button>
          </td>
        </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
</div>
