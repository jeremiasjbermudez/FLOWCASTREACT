const container = document.getElementById('expensesTables');
const searchIn = document.getElementById('searchInput');

function reloadTables() {
  fetch(`fetch_expenses.php?search=${encodeURIComponent(searchIn.value)}`)
    .then(r => r.text())
    .then(html => container.innerHTML = html);
}

searchIn.addEventListener('input', reloadTables);

container.addEventListener('click', e => {
  const tr = e.target.closest('tr');
  const id = tr?.dataset.id;
  if (!id) return;

  if (e.target.matches('.delete-btn')) {
    if (!confirm('Delete this expense?')) return;
    fetch('api/delete_expense.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${id}`
    }).then(r => r.json()).then(resp => {
      if (resp.status === 'success') tr.remove();
      else alert('Delete failed: ' + resp.message);
    });
  }

  if (e.target.matches('.edit-btn')) {
    ['Bill', 'Amount', 'DateAdded', 'Account', 'DayOfMonth'].forEach(cls => {
      const td = tr.querySelector('.' + cls);
      const val = td.textContent.trim();
      if (cls === 'Amount') {
        td.innerHTML = `<input type="number" step="0.01" class="${cls}-inp" value="${val}">`;
      } else if (cls === 'DateAdded') {
        const today = new Date().toISOString().split('T')[0];
        const safeDate = (val === '0000-00-00' || !val) ? today : val;
        td.innerHTML = `<input type="date" class="${cls}-inp" value="${safeDate}">`;
      } else if (cls === 'Account') {
        td.innerHTML = `<select class="${cls}-inp">
                          <option value="spending" ${val === 'spending' ? 'selected' : ''}>spending</option>
                          <option value="reserve" ${val === 'reserve' ? 'selected' : ''}>reserve</option>
                          <option value="growth" ${val === 'growth' ? 'selected' : ''}>growth</option>
                        </select>`;
      } else if (cls === 'DayOfMonth') {
        td.innerHTML = `<input type="number" min="1" max="31" class="${cls}-inp" value="${val}">`;
      } else {
        td.innerHTML = `<input type="text" class="${cls}-inp" value="${val}">`;
      }
    });
    e.target.textContent = 'Save';
    e.target.classList.replace('edit-btn', 'save-btn');
    const cancelBtn = tr.querySelector('.delete-btn');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.classList.replace('delete-btn', 'cancel-btn');
  }

  if (e.target.matches('.cancel-btn')) {
    reloadTables();
  }

  if (e.target.matches('.save-btn')) {
    const Bill = tr.querySelector('.Bill-inp').value;
    const Amount = tr.querySelector('.Amount-inp').value;
    const DateAdded = tr.querySelector('.DateAdded-inp').value;
    const Account = tr.querySelector('.Account-inp').value;
    const DayOfMonth = tr.querySelector('.DayOfMonth-inp').value;
    const body = new URLSearchParams({ id, Bill, Amount, DateAdded, Account, DayOfMonth });
    fetch('api/update_expense.php', { method: 'POST', body })
      .then(r => r.json())
      .then(resp => {
        if (resp.status === 'success') reloadTables();
        else alert('Update failed: ' + resp.message);
      });
  }
});
