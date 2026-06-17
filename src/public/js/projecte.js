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
const token = localStorage.getItem("token");
let userRole = null;
let userId = null;
if (token) {
  try {
    const p = JSON.parse(atob(token.split('.')[1]));
    userRole = p.idNivel_acceso;
    userId = p.idUsuario_APP;
  } catch(e) {}
}

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");
if (!projectId) { window.location.href = "/projectes.html"; }

let projecteData = null;

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

function escHtml(s) {
  if (!s) return "";
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ca-ES", { year: "numeric", month: "short", day: "numeric" });
}

document.getElementById("btnBack").addEventListener("click", () => { window.location.href = "/projectes.html"; });

async function loadProject() {
  try {
    const res = await api(`/projectes/${projectId}`);
    if (!res) return;
    projecteData = await res.json();
    renderProject(projecteData);
  } catch {
    showToast("Error carregant projecte", "error");
  }
}

function renderProject(p) {
  const now = new Date();
  const start = p.fecha_inicio_act ? new Date(p.fecha_inicio_act) : null;
  const end = p.fecha_fin_act ? new Date(p.fecha_fin_act) : null;
  const obert = (!end || end >= now) && (!start || start <= now);
  const actiu = !end || end >= now;

  document.getElementById("projectName").textContent = p.Nom_projecte || "";
  const badgeObert = document.getElementById("badgeObert");
  badgeObert.textContent = obert ? "Obert" : "Tancat";
  badgeObert.className = `badge ${obert ? 'badge-success' : 'badge-danger'}`;
  const badgeActiu = document.getElementById("badgeActiu");
  badgeActiu.textContent = actiu ? "Actiu" : "Inactiu";
  badgeActiu.className = `badge ${actiu ? 'badge-info' : 'badge-warning'}`;

  const responsable = p.responsable_Nom ? `${escHtml(p.responsable_Nom)} ${escHtml(p.responsable_Cognoms || "")}` : "No disponible";
  const respTel = p.responsable_Telefon ? escHtml(p.responsable_Telefon) : "—";
  const respEmail = p.responsable_email ? escHtml(p.responsable_email) : "—";

  const addrParts = [p.tipus_via, p.Nom_calle, p.Num_calle, p.Pis ? `Pis ${p.Pis}` : "", p.Escala ? `Esc ${p.Escala}` : "", p.barri, p.codi_postal].filter(Boolean);
  const fullAddr = addrParts.length > 0 ? addrParts.join(" ") : "No disponible";

  document.getElementById("infoGrid").innerHTML = `
    <div class="info-item"><div class="label">Data inici</div><div class="value">${formatDate(p.fecha_inicio_act)}</div></div>
    <div class="info-item"><div class="label">Data fi</div><div class="value">${formatDate(p.fecha_fin_act)}</div></div>
    <div class="info-item"><div class="label">Participants</div><div class="value">${p.inscritos || 0} / ${p.plazas || 0}</div></div>
    <div class="info-item"><div class="label">Responsable</div><div class="value">${responsable}<br><small>Tel: ${respTel}</small><br><small>Email: ${respEmail}</small></div></div>
    <div class="info-item"><div class="label">Centre coordinació</div><div class="value">No disponible</div></div>
    <div class="info-item"><div class="label">Centre activitats</div><div class="value">${escHtml(p.nom_centre_activitats || "No disponible")}<br><small>${fullAddr}</small></div></div>
  `;

  document.getElementById("projectDesc").textContent = p.Descripcio || "Sense descripció";

  renderParticipants(p.clients || []);

  const btnEditar = document.getElementById("btnEditar");
  if (userRole && [1,2].includes(userRole)) {
    btnEditar.style.display = "";
  } else if (userRole === 4 && p.responsable_id && userId && p.responsable_id == userId) {
    btnEditar.style.display = "";
  } else {
    btnEditar.style.display = "none";
  }
  btnEditar.addEventListener("click", () => { window.location.href = `/projecte-crear.html?id=${projectId}`; });
}

function renderParticipants(clients) {
  const tbody = document.getElementById("participantsBody");
  const noMsg = document.getElementById("noParticipants");
  tbody.innerHTML = "";
  if (!clients || clients.length === 0) {
    noMsg.style.display = "block";
    return;
  }
  noMsg.style.display = "none";
  for (const c of clients) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escHtml(c.Nom)}</td>
      <td>${escHtml(c.Cognoms)}</td>
      <td>${escHtml(c.Cognom_familiar || "")}</td>
      <td><button class="btn btn-danger btn-sm" data-client-id="${c.idClient}">Eliminar</button></td>
    `;
    tr.querySelector("button").addEventListener("click", async function() {
      if (!confirm(`Eliminar ${c.Nom} ${c.Cognoms} del projecte?`)) return;
      try {
        const res = await api(`/projectes/${projectId}/clients/${c.idClient}`, { method: "DELETE" });
        if (!res) return;
        if (res.ok) {
          showToast("Participant eliminat", "success");
          loadProject();
        } else {
          showToast("Error eliminant participant", "error");
        }
      } catch {
        showToast("Error de connexió", "error");
      }
    });
    tbody.appendChild(tr);
  }
}

const modalAfegir = document.getElementById("modalAfegir");
const searchClient = document.getElementById("searchClient");
const clientDropdown = document.getElementById("clientDropdown");
const clientSearchBody = document.getElementById("clientSearchBody");
const noClientResults = document.getElementById("noClientResults");
let clientDebounce = null;
let selectedClients = [];

document.getElementById("btnAfegirParticipant").addEventListener("click", () => {
  modalAfegir.style.display = "flex";
  searchClient.value = "";
  clientSearchBody.innerHTML = "";
  clientDropdown.style.display = "none";
  noClientResults.style.display = "none";
  selectedClients = [];
  searchClient.focus();
});

document.getElementById("btnCancelAfegir").addEventListener("click", () => {
  modalAfegir.style.display = "none";
});

modalAfegir.addEventListener("click", (e) => {
  if (e.target === modalAfegir) modalAfegir.style.display = "none";
});

searchClient.addEventListener("input", () => {
  clearTimeout(clientDebounce);
  const q = searchClient.value.trim();
  if (q.length < 2) { clientDropdown.style.display = "none"; return; }
  clientDebounce = setTimeout(() => searchClients(q), 400);
});

async function searchClients(q) {
  try {
    const res = await api(`/client?q=${encodeURIComponent(q)}`);
    if (!res) return;
    const data = await res.json();
    showClientDropdown(data);
  } catch {}
}

function showClientDropdown(items) {
  clientDropdown.innerHTML = "";
  if (items.length === 0) { clientDropdown.style.display = "none"; return; }
  for (const item of items) {
    if (selectedClients.some(s => s.idClient === item.idClient)) continue;
    const alreadyInProject = (projecteData.clients || []).some(c => c.idClient === item.idClient);
    if (alreadyInProject) continue;
    const div = document.createElement("div");
    div.textContent = `${item.Nom} ${item.Cognoms} (${item.Cognom_familiar || ""})`;
    div.dataset.id = item.idClient;
    div.addEventListener("click", () => addClientToSelection(item));
    clientDropdown.appendChild(div);
  }
  clientDropdown.style.display = clientDropdown.children.length > 0 ? "block" : "none";
}

function addClientToSelection(item) {
  if (selectedClients.some(s => s.idClient === item.idClient)) return;
  selectedClients.push(item);
  renderClientSelection();
  clientDropdown.style.display = "none";
  searchClient.value = "";
}

function renderClientSelection() {
  clientSearchBody.innerHTML = "";
  if (selectedClients.length === 0) { noClientResults.style.display = "block"; return; }
  noClientResults.style.display = "none";
  for (const c of selectedClients) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="checkbox" checked disabled></td><td>${escHtml(c.Nom)}</td><td>${escHtml(c.Cognoms)}</td><td>${escHtml(c.Cognom_familiar || "")}</td>`;
    clientSearchBody.appendChild(tr);
  }
  const addRow = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = 4;
  const btnAdd = document.createElement("button");
  btnAdd.className = "btn btn-primary btn-sm";
  btnAdd.textContent = `Afegir ${selectedClients.length} seleccionat(s)`;
  btnAdd.addEventListener("click", submitAddClients);
  td.appendChild(btnAdd);
  addRow.appendChild(td);
  clientSearchBody.appendChild(addRow);
}

async function submitAddClients() {
  if (selectedClients.length === 0) return;
  try {
    const res = await api(`/projectes/${projectId}/clients`, {
      method: "POST",
      body: JSON.stringify({ clientIds: selectedClients.map(c => c.idClient) })
    });
    if (!res) return;
    if (res.ok) {
      showToast("Participants afegits correctament", "success");
      modalAfegir.style.display = "none";
      loadProject();
    } else {
      const data = await res.json();
      showToast(data.message || "Error afegint participants", "error");
    }
  } catch {
    showToast("Error de connexió", "error");
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".autocomplete-wrap")) {
    clientDropdown.style.display = "none";
  }
});

loadProject();
