const $ = id => document.getElementById(id);
const cercaText = $("cercaText");
const filtreGenere = $("filtreGenere");
const filtreBarri = $("filtreBarri");
const filtreEstructura = $("filtreEstructura");
const btnPersones = $("btnPersones");
const btnFamilies = $("btnFamilies");
const thead = $("thead");
const tbody = $("tbody");
const toast = $("toast");

let mode = "persones";

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

function setMode(m) {
  mode = m;
  btnPersones.className = m === "persones" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm";
  btnFamilies.className = m === "families" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm";
  document.getElementById("filterGenere").style.display = m === "persones" ? "" : "none";
  document.getElementById("filterEstructura").style.display = m === "families" ? "" : "none";
  cercar();
}

btnPersones.addEventListener("click", () => setMode("persones"));
btnFamilies.addEventListener("click", () => setMode("families"));
$("btnCercar").addEventListener("click", cercar);
cercaText.addEventListener("keydown", e => { if (e.key === "Enter") cercar(); });

async function cercar() {
  if (mode === "persones") {
    await cercarPersones();
  } else {
    await cercarFamilies();
  }
}

async function cercarPersones() {
  const params = new URLSearchParams();
  if (cercaText.value.trim()) params.set("q", cercaText.value.trim());
  if (filtreGenere.value) params.set("genere", filtreGenere.value);
  if (filtreBarri.value) params.set("barri", filtreBarri.value);
  try {
    const res = await fetch(`/client?${params}`);
    if (!res.ok) throw new Error("Error");
    const data = await res.json();
    renderPersones(data);
  } catch {
    showToast("Error carregant persones", "error");
  }
}

function renderPersones(data) {
  thead.innerHTML = "<tr><th>Nom</th><th>Cognoms</th><th>Edat</th><th>Gènere</th><th>Família</th><th></th></tr>";
  tbody.innerHTML = "";
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hi ha persones</td></tr>';
    return;
  }
  for (const c of data) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.Nom}</td>
      <td>${c.Cognoms}</td>
      <td>${c.C_edad ?? "—"}</td>
      <td>${c.Nom_genere || "—"}</td>
      <td>${c.Cognom_familiar || "—"}</td>
      <td><a href="/client.html?id=${c.idClient}" class="btn btn-sm btn-outline">Veure</a></td>
    `;
    tbody.appendChild(tr);
  }
}

async function cercarFamilies() {
  const params = new URLSearchParams();
  if (cercaText.value.trim()) params.set("q", cercaText.value.trim());
  if (filtreEstructura.value) params.set("estructura", filtreEstructura.value);
  if (filtreBarri.value) params.set("barri", filtreBarri.value);
  try {
    const res = await fetch(`/familia?${params}`);
    if (!res.ok) throw new Error("Error");
    const data = await res.json();
    renderFamilies(data);
  } catch {
    showToast("Error carregant famílies", "error");
  }
}

function renderFamilies(data) {
  thead.innerHTML = "<tr><th>Cognom</th><th>Membres</th><th>Estructura</th><th></th></tr>";
  tbody.innerHTML = "";
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hi ha famílies</td></tr>';
    return;
  }
  for (const f of data) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.Cognom_familiar}</td>
      <td>${f.num_membres ?? 0}</td>
      <td>${f.Nom_est_fam || "—"}</td>
      <td><a href="/familia.html?id=${f.idFamilia}" class="btn btn-sm btn-outline">Veure</a></td>
    `;
    tbody.appendChild(tr);
  }
}

Promise.all([
  loadSelect("/desplegables/genere", filtreGenere),
  loadSelect("/desplegables/barri", filtreBarri),
  loadSelect("/desplegables/estructura_familiar", filtreEstructura),
]).then(() => {
  setMode("persones");
});
