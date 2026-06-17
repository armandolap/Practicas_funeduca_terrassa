async function api(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!options.noJson) headers["Content-Type"] = "application/json";
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) { localStorage.removeItem("token"); window.location.href = "/login.html"; return null; }
  return res;
}

const toast = document.getElementById("toast");
const projectGrid = document.getElementById("projectGrid");
const searchInput = document.getElementById("searchProjectes");
const btnCrear = document.getElementById("btnCrearProjecte");

let currentFilter = "activos";
let debounceTimer = null;

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

const token = localStorage.getItem("token");
let userRole = null;
if (token) {
  try {
    userRole = JSON.parse(atob(token.split('.')[1])).idNivel_acceso;
  } catch(e) {}
}

if (btnCrear) {
  btnCrear.style.display = (userRole && [1,2,4].includes(userRole)) ? "" : "none";
  btnCrear.addEventListener("click", () => { window.location.href = "/projecte-crear.html"; });
}

document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.filter;
    loadProjects();
  });
});

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProjects, 350);
});

async function loadProjects() {
  const q = searchInput.value.trim();
  const params = new URLSearchParams();
  if (currentFilter) params.set("filter", currentFilter);
  if (q) params.set("q", q);
  try {
    const res = await api(`/projectes?${params.toString()}`);
    if (!res) return;
    const data = await res.json();
    renderProjects(data);
  } catch {
    showToast("Error carregant projectes", "error");
  }
}

function renderProjects(projects) {
  projectGrid.innerHTML = "";
  if (!projects || projects.length === 0) {
    projectGrid.innerHTML = "<p style='color:#888;grid-column:1/-1;'>No hi ha projectes</p>";
    return;
  }
  for (const p of projects) {
    const now = new Date();
    const start = p.fecha_inicio_act ? new Date(p.fecha_inicio_act) : null;
    const end = p.fecha_fin_act ? new Date(p.fecha_fin_act) : null;
    const obert = (!end || end >= now) && (!start || start <= now);
    const actiu = !end || end >= now;
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <h3>${escHtml(p.Nom_projecte || "")}</h3>
      <div class="meta"><strong>Dates:</strong> ${formatDate(p.fecha_inicio_act)} - ${formatDate(p.fecha_fin_act)}</div>
      <div class="meta"><strong>Places:</strong> ${p.inscritos || 0} / ${p.plazas || 0}</div>
      <div class="meta"><strong>Responsable:</strong> ${escHtml(responsableName(p))}</div>
      <div class="meta"><strong>Centre:</strong> ${escHtml(p.nom_centre_activitats || "")}</div>
      <div style="margin-top:0.5rem;">
        <span class="badge ${obert ? 'badge-success' : 'badge-danger'}">${obert ? 'Obert' : 'Tancat'}</span>
        <span class="badge ${actiu ? 'badge-info' : 'badge-warning'}">${actiu ? 'Actiu' : 'Inactiu'}</span>
      </div>
    `;
    card.addEventListener("click", () => { window.location.href = `/projecte.html?id=${p.idProyecto}`; });
    projectGrid.appendChild(card);
  }
}

function escHtml(s) {
  if (!s) return "";
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("ca-ES", { year: "numeric", month: "short", day: "numeric" });
}

function responsableName(p) {
  if (p.responsable) return p.responsable;
  return "Sense assignar";
}

loadProjects();
