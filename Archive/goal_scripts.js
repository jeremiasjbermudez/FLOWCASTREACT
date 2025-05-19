document.addEventListener('DOMContentLoaded', function () {

  // Edit Transaction Inline
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-entry')) {
      const row = e.target.closest('tr');
      row.querySelectorAll('[data-field]').forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
        cell.classList.add('bg-warning-subtle');
      });

      e.target.textContent = 'Save';
      e.target.classList.remove('edit-entry');
      e.target.classList.add('save-entry');
    }

    else if (e.target.classList.contains('save-entry')) {
      const button = e.target;
      const row = button.closest('tr');
      const id = row.dataset.id;
      const formData = new FormData();
      formData.append('id', id);

      row.querySelectorAll('[contenteditable][data-field]').forEach(cell => {
        const field = cell.dataset.field;
        let value = cell.innerText.trim();
        if (field === 'Amount') value = value.replace(/[\$,]/g, '');
        formData.append(field, value);
        cell.removeAttribute('contenteditable');
        cell.classList.remove('bg-warning-subtle');
        cell.style.backgroundColor = '#e0ffe0';
        setTimeout(() => cell.style.backgroundColor = '', 800);
      });

      fetch('update_goal_tx.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        button.textContent = 'Edit';
button.classList.remove('save-entry');
button.classList.add('edit-entry');
      })
      .catch(err => alert("Error: " + err.message));
    }
  });

  // Delete Transaction
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-entry')) {
      if (!confirm("Are you sure you want to delete this transaction?")) return;
      const row = e.target.closest('tr');
      const id = row.dataset.id;
      const formData = new FormData();
      formData.append('id', id);

      fetch('delete_goal_tx.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        if (msg.includes('successfully')) row.remove();
      })
      .catch(err => alert("Error: " + err.message));
    }
  });

  // Edit Goal Card Inline
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-goal')) {
      const button = e.target;
      const card = button.closest('.card');
      const id = button.dataset.id;
      let firstEditable = null;

      ['Name', 'Category', 'Description', 'CurrentBalance', 'InterestRate', 'EstMonthlyPmt', 'PayOffTime', 'PayOffTimeYrs', 'totalInterestPaid'].forEach(field => {
        const span = card.querySelector(`[data-field="${field}"]`);
        if (span) {
          span.setAttribute('contenteditable', 'true');
          span.classList.add('bg-warning-subtle');
          if (!firstEditable) firstEditable = span;
        }
      });

      if (firstEditable) firstEditable.focus();

      button.textContent = 'Save';
      button.classList.remove('edit-goal');
      button.classList.add('save-goal');
      button.setAttribute('data-id', id);
    }

    else if (e.target.classList.contains('save-goal')) {
      const button = e.target;
      const card = button.closest('.card');
      const id = button.dataset.id;
      const formData = new FormData();
      formData.append('id', id);

      ['Name', 'Category', 'Description', 'CurrentBalance', 'InterestRate', 'EstMonthlyPmt', 'PayOffTime', 'PayOffTimeYrs', 'totalInterestPaid'].forEach(field => {
        const span = card.querySelector(`[data-field="${field}"]`);
        if (span) {
          formData.append(field, span.innerText.trim());
          span.removeAttribute('contenteditable');
          span.classList.remove('bg-warning-subtle');
          span.style.backgroundColor = '#d1ffd1';
          setTimeout(() => span.style.backgroundColor = '', 800);
        }
      });

      fetch('update_goal.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        button.textContent = 'Edit';
        button.classList.remove('save-goal');
        button.classList.add('edit-goal');
        button.setAttribute('data-id', id);
        document.getElementById('payoffCalcFrame').src = 'calculate_payoff.php';


      })
      .catch(err => alert("Error: " + err.message));
    }
  });

  // Delete Goal Card
  document.querySelectorAll('.delete-goal').forEach(button => {
    button.addEventListener('click', () => {
      if (!confirm("Are you sure you want to delete this goal?")) return;
      const id = button.dataset.id;
      const formData = new FormData();
      formData.append('id', id);

      fetch('delete_goal.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        if (msg.includes('successfully')) {
          button.closest('.col-md-4').remove();
        }
      })
      .catch(err => alert("Error: " + err.message));
    });
  });

});
