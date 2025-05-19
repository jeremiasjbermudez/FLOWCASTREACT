
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const tableContainer = document.getElementById("table-content");

  function fetchData() {
    const search = searchInput?.value || '';
    const from = startDate?.value || '';
    const to = endDate?.value || '';

    const params = new URLSearchParams({
      search: search,
      start_date: from,
      end_date: to
    });

    fetch("fetch_projection.php?" + params.toString())
      .then((res) => res.text())
      .then((html) => {
        if (tableContainer) {
          tableContainer.innerHTML = html;
        }
      });
  }

  if (searchInput) searchInput.addEventListener("input", fetchData);
  if (startDate) startDate.addEventListener("change", fetchData);
  if (endDate) endDate.addEventListener("change", fetchData);

  // Initial load
  fetchData();
});
