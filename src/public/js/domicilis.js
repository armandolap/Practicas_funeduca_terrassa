const $ = id => document.getElementById(id);
const tbody = $("tbodyDomicilis");
const filtreBarri = $("filtreBarri");
const filtreTipus = $("filtreTipus");
const btnAnterior = $("btnAnterior");
const btnSegüent = $("btnSegüent");
const pagInfo = $("paginacioInfo");
const toast = $("toast");

let currentOffset = 0;
const LIMIT = 15;

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

async function loadSelect(url, select) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const items = await res.json();
    for (const item of items) {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.Nom;
      select.appendChild(opt);
    }
  } catch {}
}

async function fetchDomicilis() {
  const params = new URLSearchParams();
  if (filtreBarri.value) params.set("barri", filtreBarri.value);
  if (filtreTipus.value) params.set("tipus", filtreTipus.value);
  params.set("offset", currentOffset);
  params.set("limit", LIMIT);
  try {
    const res = await fetch(`/domicili?${params}`);
    if (!res.ok) throw new Error("Error");
    return await res.json();
  } catch {
    showToast("Error carregant domicilis", "error");
    return [];
  }
}

function renderDomicilis(data) {
  tbody.innerHTML = "";
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hi ha domicilis</td></tr>';
    return;
  }
  for (const d of data) {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.addEventListener("click", () => { window.location.href = `/domicili.html?id=${d.idDomicili}`; });
    const parts = [d.adreca_completa];
    if (d.Pis) parts.push(`Pis ${d.Pis}`);
    if (d.Escala) parts.push(`Esc ${d.Escala}`);
    parts.push(`(${d.barri}, ${d.codi_postal})`);
    tr.innerHTML = `
      <td>${parts.join(" ")}</td>
      <td>${d.Nom_domicili || "—"}</td>
      <td>${d.quantitat_gent ?? 0}</td>
      <td>${d.familia_principal || "—"}</td>
    `;
    tbody.appendChild(tr);
  }
}

function updatePagination(data) {
  pagInfo.textContent = `${currentOffset + 1}–${currentOffset + data.length}`;
  btnAnterior.disabled = currentOffset === 0;
  btnSegüent.disabled = data.length < LIMIT;
}

async function loadTable() {
  const data = await fetchDomicilis();
  renderDomicilis(data);
  updatePagination(data);
}

btnAnterior.addEventListener("click", () => {
  if (currentOffset > 0) { currentOffset -= LIMIT; loadTable(); }
});

btnSegüent.addEventListener("click", () => {
  currentOffset += LIMIT; loadTable();
});

$("btnFiltrar").addEventListener("click", () => {
  currentOffset = 0;
  loadTable();
});

Promise.all([
  loadSelect("/desplegables/barri", filtreBarri),
  loadSelect("/desplegables/tipus_domicili", filtreTipus),
]).then(() => loadTable());
