// forecast_search.js

const container = document.getElementById('forecastContainer');
const searchInput = document.getElementById('forecastSearch');
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

function fetchForecast() {
    const q = encodeURIComponent(searchInput.value);
    const start = encodeURIComponent(startInput.value);
    const end = encodeURIComponent(endInput.value);
    fetch(`fetch_forecast.php?q=${q}&start=${start}&end=${end}`)
      .then(r => r.text())
      .then(html => { container.innerHTML = html; })
      .catch(err => {
        console.error(err);
        container.innerHTML = '<div class="alert alert-danger">Load error.</div>';
      });
}

// trigger on input/change
searchInput.addEventListener('input', fetchForecast);
startInput.addEventListener('change', fetchForecast);
endInput.addEventListener('change', fetchForecast);
