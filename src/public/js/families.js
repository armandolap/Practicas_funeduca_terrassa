const $ = id => document.getElementById(id);
const searchText = $("searchText");
const filterEstructura = $("filterEstructura");
const filterBarri = $("filterBarri");
const btnSearch = $("btnSearch");
const familiesBody = $("familiesBody");
const prevPage = $("prevPage");
const nextPage = $("nextPage");
const pageInfo = $("pageInfo");
const toast = $("toast");

let currentOffset = 0;
const LIMIT = 15;

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

function loadSelect(url, select) {
  return fetch(url).then(r => r.ok ? r.json() : []).then(items => {
    for (const item of items) {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.Nom;
      select.appendChild(opt);
    }
  }).catch(() => {});
}

async function loadFilters() {
  await Promise.all([
    loadSelect("/desplegables/estructura_familiar", filterEstructura),
    loadSelect("/desplegables/barri", filterBarri)
  ]);
}

function renderRow(f) {
  const tr = document.createElement("tr");
  tr.className = "clickable";
  tr.dataset.id = f.idFamilia;
  const menors = f.num_menors || 0;
  const majors = f.num_majors || 0;
  tr.innerHTML = `
    <td>${f.Cognom_familiar}</td>
    <td>${f.num_membres || 0}</td>
    <td>${menors} / ${majors}</td>
    <td>${f.Nom_est_fam || ""}</td>
    <td>${f.domicili_principal || ""}</td>
    <td>-</td>
  `;
  tr.addEventListener("click", () => {
    window.location.href = `/familia.html?id=${f.idFamilia}`;
  });
  familiesBody.appendChild(tr);
}

async function loadData() {
  const q = searchText.value.trim();
  const estructura = filterEstructura.value;
  const barri = filterBarri.value;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (estructura) params.set("estructura", estructura);
  if (barri) params.set("barri", barri);
  params.set("offset", currentOffset);
  params.set("limit", LIMIT);
  try {
    const res = await fetch(`/familia?${params.toString()}`);
    if (!res.ok) { showToast("Error carregant famílies", "error"); return; }
    const data = await res.json();
    familiesBody.innerHTML = "";
    if (data.length === 0) {
      familiesBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">No s\'han trobat famílies</td></tr>';
    } else {
      data.forEach(renderRow);
    }
    pageInfo.textContent = `Pàgina ${Math.floor(currentOffset / LIMIT) + 1}`;
    prevPage.disabled = currentOffset === 0;
    nextPage.disabled = data.length < LIMIT;
  } catch { showToast("Error de connexió", "error"); }
}

prevPage.addEventListener("click", () => {
  if (currentOffset > 0) { currentOffset -= LIMIT; loadData(); }
});

nextPage.addEventListener("click", () => {
  currentOffset += LIMIT; loadData();
});

btnSearch.addEventListener("click", () => {
  currentOffset = 0; loadData();
});

searchText.addEventListener("keydown", e => {
  if (e.key === "Enter") { currentOffset = 0; loadData(); }
});

loadFilters().then(() => loadData());
