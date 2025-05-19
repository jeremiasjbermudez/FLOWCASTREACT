const container = document.getElementById('depositsTables');
const searchIn = document.getElementById('searchInput');

function reloadTables() {
  fetch(`fetch_deposits.php?search=${encodeURIComponent(searchIn.value)}`)
    .then(r => r.text())
    .then(html => container.innerHTML = html);
}

searchIn.addEventListener('input', reloadTables);

container.addEventListener('click', e => {
  const tr = e.target.closest('tr');
  const id = tr?.dataset.id;
  if (!id) return;

  if (e.target.matches('.delete-btn')) {
    if (!confirm('Delete this deposit?')) return;
    fetch('api/delete_deposit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${id}`
    }).then(r => r.json()).then(resp => {
      if (resp.status === 'success') tr.remove();
      else alert('Delete failed: ' + resp.message);
    });
  }

  if (e.target.matches('.edit-btn')) {
    ['Bill', 'Amount', 'DateAdded', 'Account'].forEach(cls => {
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
    const body = new URLSearchParams({ id, Bill, Amount, DateAdded, Account });

    fetch('api/update_deposit.php', { method: 'POST', body })
      .then(r => r.json())
      .then(resp => {
        if (resp.status === 'success') reloadTables();
        else alert('Update failed: ' + resp.message);
      });
  }
});
