var PAGE_SIZE = 15;
var currentPage = 1;
var allClients = [];

var $ = function(id) { return document.getElementById(id); };

var AGE_MAP = {
  "0-3": [0, 3], "4-6": [4, 6], "7-9": [7, 9], "10-12": [10, 12],
  "13-15": [13, 15], "16-18": [16, 18], "18-30": [18, 30],
  "30-65": [30, 65], "+65": [65, null]
};

function loadSelect(url, sel) {
  return fetch(url).then(function(r) { return r.json(); }).then(function(items) {
    items.forEach(function(item) {
      var opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.Nom;
      sel.appendChild(opt);
    });
  });
}

function loadDesplegables() {
  loadSelect("/desplegables/genere", $("filterGenere"));
  loadSelect("/desplegables/barri", $("filterBarri"));
}

var familyTimeout;
$("filterFamilia").addEventListener("input", function() {
  clearTimeout(familyTimeout);
  var q = this.value.trim();
  if (q.length < 2) { $("familiaDropdown").style.display = "none"; return; }
  familyTimeout = setTimeout(function() { searchFamilies(q); }, 300);
});

function searchFamilies(q) {
  fetch("/familia/search?q=" + encodeURIComponent(q)).then(function(r) { return r.json(); }).then(function(items) {
    var dd = $("familiaDropdown");
    dd.innerHTML = "";
    items.forEach(function(item) {
      var div = document.createElement("div");
      div.textContent = item.Cognom_familiar + " (ID: " + item.idFamilia + ")";
      div.addEventListener("click", function() {
        $("filterFamilia").value = item.Cognom_familiar;
        $("filterFamilia").dataset.familiaId = item.idFamilia;
        dd.style.display = "none";
        applyFilters();
      });
      dd.appendChild(div);
    });
    dd.style.display = items.length ? "block" : "none";
  });
}

document.addEventListener("click", function(e) {
  if (!e.target.closest(".autocomplete-wrap")) {
    $("familiaDropdown").style.display = "none";
  }
});

$("filterAge").addEventListener("change", applyFilters);
$("filterGenere").addEventListener("change", applyFilters);
$("filterBarri").addEventListener("change", applyFilters);

var searchDebounce;
$("filterSearch").addEventListener("input", function() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(applyFilters, 300);
});

$("filterFamilia").addEventListener("blur", function() {
  if (!this.dataset.familiaId) { this.value = ""; }
});

function applyFilters() {
  currentPage = 1;
  fetchClients();
}

function fetchClients() {
  var q = $("filterSearch").value.trim();
  var familia = $("filterFamilia").dataset.familiaId || "";
  var genere = $("filterGenere").value;
  var barri = $("filterBarri").value;
  var ageSegment = $("filterAge").value;
  var edatMin = "", edatMax = "";
  if (ageSegment && AGE_MAP[ageSegment]) {
    edatMin = AGE_MAP[ageSegment][0];
    edatMax = AGE_MAP[ageSegment][1] || "";
  }
  var params = new URLSearchParams({ q: q, familia: familia, genere: genere, barri: barri, edatMin: edatMin, edatMax: edatMax });
  fetch("/client?" + params.toString()).then(function(r) { return r.json(); }).then(function(data) {
    allClients = data;
    renderTable();
  });
}

function renderTable() {
  var start = (currentPage - 1) * PAGE_SIZE;
  var page = allClients.slice(start, start + PAGE_SIZE);
  var tbody = $("clientsBody");
  tbody.innerHTML = "";
  page.forEach(function(c) {
    var tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.addEventListener("click", function() {
      window.location.href = "/client.html?id=" + c.idClient;
    });
    tr.innerHTML = "<td>" + esc(c.Nom) + "</td><td>" + esc(c.Cognoms) + "</td><td>" + (c.C_edad != null ? c.C_edad : "") + "</td><td>" + esc(c.Cognom_familiar) + "</td><td>" + esc(c.projectes || "") + "</td>";
    tbody.appendChild(tr);
  });
  renderPagination();
}

function esc(s) {
  if (!s) return "";
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderPagination() {
  var total = Math.ceil(allClients.length / PAGE_SIZE) || 1;
  $("pageInfo").textContent = "P\xE0gina " + currentPage + " de " + total;
  $("prevBtn").disabled = currentPage <= 1;
  $("nextBtn").disabled = currentPage >= total;
}

$("prevBtn").addEventListener("click", function() {
  if (currentPage > 1) { currentPage--; renderTable(); }
});

$("nextBtn").addEventListener("click", function() {
  var total = Math.ceil(allClients.length / PAGE_SIZE);
  if (currentPage < total) { currentPage++; renderTable(); }
});

loadDesplegables();
fetchClients();
