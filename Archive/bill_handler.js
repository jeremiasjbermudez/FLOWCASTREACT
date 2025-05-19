document.addEventListener('DOMContentLoaded', function () {
  const addBtn = document.getElementById('add-btn');

  // ADD
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      const data = {
        Bill: document.getElementById('new-Bill').value,
        DayOfMonth: document.getElementById('new-DayOfMonth').value,
        Amount: document.getElementById('new-Amount').value,
        ActualAmnt: document.getElementById('new-ActualAmnt').value,
        ContainsText: document.getElementById('new-ContainsText').value,
        Account: document.getElementById('new-Account').value
      };

      fetch('add_bill.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(() => location.reload());
    });
  }

  // DELETE
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const row = this.closest('tr');
      const id = row.dataset.id;
      if (confirm('Delete this bill?')) {
        fetch('delete_bill.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        }).then(() => location.reload());
      }
    });
  });

  // EDIT
  document.querySelectorAll('.edit-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const row = this.closest('tr');
      const id = row.dataset.id;
      const fields = row.querySelectorAll('.editable');
      const data = { id };

      fields.forEach(cell => {
        data[cell.dataset.field] = cell.innerText.trim();
      });

      fetch('edit_bill.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(() => location.reload());
    });
  });
});