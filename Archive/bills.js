<script>
document.addEventListener("DOMContentLoaded", () => {
  function delegateEvents() {
    document.querySelectorAll("#billsContainer .edit-btn").forEach(btn => {
      btn.onclick = () => {
        const row = btn.closest("tr");
        row.querySelectorAll("td.Bill, td.Amount, td.DayOfMonth").forEach(td => {
          const input = document.createElement("input");
          input.value = td.textContent.trim();
          input.className = "form-control form-control-sm";
          input.name = td.className;
          td.innerHTML = "";
          td.appendChild(input);
        });

        const accountSel = row.querySelector("select");
        if (accountSel) accountSel.disabled = false;

        row.querySelector(".save-btn").classList.remove("d-none");
        btn.classList.add("d-none");
      };
    });

    document.querySelectorAll("#billsContainer .save-btn").forEach(btn => {
      btn.onclick = () => {
        const row = btn.closest("tr");
        const id = row.dataset.id;
        const Bill = row.querySelector("input[name='Bill']").value;
        const Amount = row.querySelector("input[name='Amount']").value;
        const DayOfMonth = row.querySelector("input[name='DayOfMonth']").value;
        const Account = row.querySelector("select").value;

        const body = new URLSearchParams({ id, Bill, Amount, DayOfMonth, Account });

        fetch("api/update_bill.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        })
        .then(res => res.json())
        .then(resp => {
          if (resp.status === "success") {
            loadBills(); // Refresh the table
          } else {
            alert("Update failed: " + resp.message);
          }
        });
      };
    });

    document.querySelectorAll("#billsContainer .delete-btn").forEach(btn => {
      btn.onclick = () => {
        if (!confirm("Delete this bill?")) return;

        const row = btn.closest("tr");
        const id = row.dataset.id;

        fetch("api/delete_bill.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `id=${id}`
        })
        .then(res => res.json())
        .then(resp => {
          if (resp.status === "success") {
            row.remove();
          } else {
            alert("Delete failed: " + resp.message);
          }
        });
      };
    });
  }

  window.loadBills = () => {
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const q = document.getElementById("searchInput").value;
    const query = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&q=${encodeURIComponent(q)}`;

    fetch(`fetch_bills_1.php?${query}`)
      .then(res => res.text())
      .then(html => {
        document.getElementById("billsContainer").innerHTML = html;
        delegateEvents(); // re-bind after injection
      });
  };

  // Initial load happens via resetToMonth in main script
});
</script>
