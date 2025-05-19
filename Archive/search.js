document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "fetch_data.php?search=" + encodeURIComponent(query), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("tables").innerHTML = xhr.responseText;
        }
    };
    xhr.send();
});