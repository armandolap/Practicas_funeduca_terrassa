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

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

const nomProjecte = document.getElementById("nomProjecte");
const plazas = document.getElementById("plazas");
const fechaInicio = document.getElementById("fechaInicio");
const fechaFin = document.getElementById("fechaFin");
const descripcio = document.getElementById("descripcio");

const centreSearch = document.getElementById("centreSearch");
const centreDropdown = document.getElementById("centreDropdown");
const centreSelected = document.getElementById("centreSelected");
const centreSelectedName = document.getElementById("centreSelectedName");
const clearCentreBtn = document.getElementById("clearCentreBtn");
const newCentreForm = document.getElementById("newCentreForm");
const nomCentre = document.getElementById("nomCentre");
const tipusVia = document.getElementById("tipusVia");
const nomCalle = document.getElementById("nomCalle");
const calleDropdown = document.getElementById("calleDropdown");
const numCalle = document.getElementById("numCalle");
const pis = document.getElementById("pis");
const escala = document.getElementById("escala");
const barri = document.getElementById("barri");
const codiPostal = document.getElementById("codiPostal");
const responsable = document.getElementById("responsable");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancel = document.getElementById("btnCancel");
const formTitle = document.getElementById("formTitle");

let selectedCentreId = null;
let selectedCallejeroId = null;
let centreDebounce = null;
let calleDebounce = null;

if (editId) {
  formTitle.textContent = "Editar Projecte";
  btnGuardar.textContent = "Actualitzar projecte";
}

btnCancel.addEventListener("click", () => { window.location.href = "/projectes.html"; });
document.getElementById("btnBack").addEventListener("click", () => { window.location.href = "/projectes.html"; });

async function loadSelect(url, select, idKey, labelKey) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const items = await res.json();
    for (const item of items) {
      const opt = document.createElement("option");
      opt.value = item[idKey] ?? item.id;
      opt.textContent = item[labelKey] ?? item.Nom;
      select.appendChild(opt);
    }
  } catch {}
}

async function initDropdowns() {
  await loadSelect("/desplegables/tipus_via", tipusVia);
  await loadSelect("/desplegables/barri", barri, "id", "Nom");
  await loadSelect("/desplegables/codi_postal", codiPostal, "id", "Nom");
}

async function loadResponsables() {
  try {
    const res = await api("/usuario?filter=tots");
    if (!res) return;
    const items = await res.json();
    for (const item of items) {
      const opt = document.createElement("option");
      opt.value = item.idUsuario_APP;
      opt.textContent = `${item.Nom} ${item.Cognoms}${item.email ? ` (${item.email})` : ""}`;
      responsable.appendChild(opt);
    }
  } catch {}
}

if (editId) {
  async function loadProjectForEdit() {
    try {
      const res = await api(`/projectes/${editId}`);
      if (!res) return;
      const p = await res.json();
      nomProjecte.value = p.Nom_projecte || "";
      plazas.value = p.plazas || 0;
      fechaInicio.value = p.fecha_inicio_act ? p.fecha_inicio_act.split("T")[0] : "";
      fechaFin.value = p.fecha_fin_act ? p.fecha_fin_act.split("T")[0] : "";
      descripcio.value = p.Descripcio || "";
      if (p.idcentre_activitats) {
        selectedCentreId = p.idcentre_activitats;
        centreSearch.value = p.nom_centre_activitats || "";
        centreSelectedName.textContent = p.nom_centre_activitats || "";
        centreSelected.style.display = "flex";
        newCentreForm.style.display = "none";
      }
      if (p.responsable_id) {
        responsable.value = p.responsable_id;
      }
    } catch {
      showToast("Error carregant projecte", "error");
    }
  }
  loadProjectForEdit();
}

centreSearch.addEventListener("input", () => {
  clearTimeout(centreDebounce);
  const q = centreSearch.value.trim();
  if (q.length < 2) { centreDropdown.style.display = "none"; return; }
  if (selectedCentreId) clearCentre();
  centreDebounce = setTimeout(() => searchCentres(q), 400);
});

async function searchCentres(q) {
  try {
    const res = await api(`/centreActivitats/search?q=${encodeURIComponent(q)}`);
    if (!res) return;
    const items = await res.json();
    showCentreDropdown(items);
  } catch {}
}

function showCentreDropdown(items) {
  centreDropdown.innerHTML = "";
  if (items.length === 0) {
    const div = document.createElement("div");
    div.textContent = "No s'ha trobat cap centre. Crear-ne un de nou?";
    div.style.color = "#e94560";
    div.style.fontStyle = "italic";
    div.addEventListener("click", () => showNewCentreForm());
    centreDropdown.appendChild(div);
    centreDropdown.style.display = "block";
    return;
  }
  for (const item of items) {
    const div = document.createElement("div");
    div.textContent = item.nom_centre_activitats;
    if (item.barri_nom) {
      const sm = document.createElement("small");
      sm.textContent = ` ${item.tipus_via_nom || ""} ${item.Nom_calle || ""}, ${item.barri_nom} (${item.codi_postal_val || ""})`;
      div.appendChild(sm);
    }
    div.addEventListener("click", () => selectCentre(item));
    centreDropdown.appendChild(div);
  }
  const createDiv = document.createElement("div");
  createDiv.textContent = "+ Crear un centre nou";
  createDiv.style.color = "#0f3460";
  createDiv.style.fontWeight = "600";
  createDiv.addEventListener("click", () => showNewCentreForm());
  centreDropdown.appendChild(createDiv);
  centreDropdown.style.display = "block";
}

function selectCentre(item) {
  selectedCentreId = item.idcentre_activitats;
  centreSearch.value = item.nom_centre_activitats;
  centreSelectedName.textContent = item.nom_centre_activitats;
  centreSelected.style.display = "flex";
  newCentreForm.style.display = "none";
  centreDropdown.style.display = "none";
}

function clearCentre() {
  selectedCentreId = null;
  centreSearch.value = "";
  centreSelected.style.display = "none";
  centreSelectedName.textContent = "";
  newCentreForm.style.display = "none";
}

clearCentreBtn.addEventListener("click", clearCentre);

function showNewCentreForm() {
  centreDropdown.style.display = "none";
  centreSearch.value = "";
  centreSelected.style.display = "none";
  selectedCentreId = null;
  newCentreForm.style.display = "block";
}

nomCalle.addEventListener("input", () => {
  clearTimeout(calleDebounce);
  const q = nomCalle.value.trim();
  const tv = tipusVia.value;
  if (q.length < 3) { calleDropdown.style.display = "none"; return; }
  calleDebounce = setTimeout(() => searchCallejero(q, tv), 400);
});

async function searchCallejero(q, tv) {
  try {
    let url = `/callejero?q=${encodeURIComponent(q)}`;
    if (tv) url += `&tipus_via=${tv}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const items = await res.json();
    showCalleDropdown(items);
  } catch {}
}

function showCalleDropdown(items) {
  calleDropdown.innerHTML = "";
  if (items.length === 0) {
    calleDropdown.style.display = "none";
    return;
  }
  for (const item of items) {
    const div = document.createElement("div");
    div.textContent = item.Nom_complet || `${item.tipus_via || ""} ${item.Nom_calle || ""}`;
    const sm = document.createElement("small");
    sm.textContent = ` ${item.barri || ""} ${item.codi_postal || ""}`;
    div.appendChild(sm);
    div.addEventListener("click", () => selectCallejero(item));
    calleDropdown.appendChild(div);
  }
  calleDropdown.style.display = "block";
}

function selectCallejero(item) {
  selectedCallejeroId = item.idcallejero;
  nomCalle.value = item.Nom_calle || "";
  tipusVia.value = item.idTipus_via || "";
  if (item.barri) {
    for (const opt of barri.options) {
      if (opt.textContent === item.barri) { barri.value = opt.value; break; }
    }
  }
  if (item.codi_postal) {
    for (const opt of codiPostal.options) {
      if (opt.textContent === item.codi_postal) { codiPostal.value = opt.value; break; }
    }
  }
  calleDropdown.style.display = "none";
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#centreSearch, #centreDropdown")) {
    centreDropdown.style.display = "none";
  }
  if (!e.target.closest("#nomCalle, #calleDropdown, #tipusVia")) {
    calleDropdown.style.display = "none";
  }
});

btnGuardar.addEventListener("click", submitForm);

async function submitForm() {
  if (!nomProjecte.value.trim()) { showToast("El nom del projecte és obligatori", "error"); nomProjecte.focus(); return; }
  if (!plazas.value && plazas.value !== "0") { showToast("Indica el nombre de places", "error"); plazas.focus(); return; }
  if (!fechaInicio.value) { showToast("La data d'inici és obligatòria", "error"); fechaInicio.focus(); return; }

  let idcentre = selectedCentreId;

  if (!idcentre) {
    const centreName = nomCentre.value.trim();
    if (!centreName) {
      showToast("Selecciona o crea un centre d'activitats", "error");
      centreSearch.focus();
      return;
    }
    if (!selectedCallejeroId || !numCalle.value.trim()) {
      showToast("Selecciona un carrer i indica el número per al nou centre", "error");
      return;
    }
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Creant centre...";
    try {
      const centreRes = await api("/centreActivitats", {
        method: "POST",
        body: JSON.stringify({
          nom_centre_activitats: centreName,
          new_direccio: {
            idcallejero: selectedCallejeroId,
            Num_calle: numCalle.value.trim(),
            Pis: pis.value.trim() || null,
            Escala: escala.value.trim() || null
          }
        })
      });
      if (!centreRes) return;
      const centreData = await centreRes.json();
      if (!centreData.id) {
        showToast("Error creant centre. El backend ha de gestionar new_direccio.", "error");
        btnGuardar.disabled = false;
        btnGuardar.textContent = editId ? "Actualitzar projecte" : "Guardar projecte";
        return;
      }
      idcentre = centreData.id;
    } catch {
      showToast("Error creant centre", "error");
      btnGuardar.disabled = false;
      btnGuardar.textContent = editId ? "Actualitzar projecte" : "Guardar projecte";
      return;
    }
  }

  btnGuardar.disabled = true;
  btnGuardar.textContent = editId ? "Actualitzant..." : "Creant projecte...";

  const payload = {
    projecte: {
      Nom_projecte: nomProjecte.value.trim(),
      Descripcio: descripcio.value.trim() || null,
      plazas: parseInt(plazas.value) || 0,
      fecha_inicio_act: fechaInicio.value || null,
      fecha_fin_act: fechaFin.value || null,
      idcentre_activitats: idcentre
    }
  };

  if (responsable.value) {
    payload.projecte.responsable = parseInt(responsable.value);
  }

  try {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/projectes/${editId}` : "/projectes";
    const res = await api(url, { method, body: JSON.stringify(payload) });
    if (!res) return;
    if (res.ok) {
      showToast(editId ? "Projecte actualitzat correctament" : "Projecte creat correctament", "success");
      setTimeout(() => { window.location.href = "/projectes.html"; }, 1000);
    } else {
      const data = await res.json();
      showToast(data.message || "Error guardant projecte", "error");
    }
  } catch {
    showToast("Error de connexió", "error");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = editId ? "Actualitzar projecte" : "Guardar projecte";
  }
}

initDropdowns();
loadResponsables();
