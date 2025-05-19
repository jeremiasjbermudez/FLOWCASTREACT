<?php
$conn = new mysqli('localhost', 'admin', 'ti@A4pnc', 'PNCaccounts');
if ($conn->connect_error) die('Connection failed: ' . $conn->connect_error);

$accounts = ['spending' => 'Spending', 'reserve' => 'Reserve', 'growth' => 'Growth'];
?>

<div class="d-flex flex-column gap-4"> <!-- forces vertical stacking -->

<?php foreach ($accounts as $key => $label): ?>
  <div class="table-wrapper mb-4">
    <h3><?= $label ?> Expenses</h3>
    <table class="table table-striped" data-account="<?= $key ?>">
      <thead>
        <tr>
          <th>Bill</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Account</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php
          $sql = "SELECT * FROM Expenses WHERE Account = '$key' ORDER BY DateAdded DESC";
          $res = $conn->query($sql);
          while ($row = $res->fetch_assoc()):
        ?>
        <tr data-id="<?= $row['ID'] ?>">
          <td class="Bill" contenteditable="true"><?= htmlspecialchars($row['Bill']) ?></td>
          <td class="Amount" contenteditable="true"><?= htmlspecialchars($row['Amount']) ?></td>
          <td class="DateAdded" contenteditable="true"><?= htmlspecialchars($row['DateAdded']) ?></td>
          <td class="Account">
            <select class="form-select form-select-sm Account-inp" disabled>
              <option value="spending" <?= $row['Account'] == 'spending' ? 'selected' : '' ?>>Spending</option>
              <option value="reserve" <?= $row['Account'] == 'reserve' ? 'selected' : '' ?>>Reserve</option>
              <option value="growth" <?= $row['Account'] == 'growth' ? 'selected' : '' ?>>Growth</option>
            </select>
          </td>
          <td>
            <button class="btn btn-sm btn-primary edit-btn">Edit</button>
            <button class="btn btn-sm btn-success save-btn d-none">Save</button>
            <button class="btn btn-sm btn-danger delete-btn">Delete</button>
          </td>
        </tr>
        <?php endwhile; ?>
      </tbody>
    </table>
  </div>
<?php endforeach; ?>

</div> <!-- end vertical stack wrapper -->

<?php $conn->close(); ?>
