// Auth check
const token = localStorage.getItem("token");
if (!token) { window.location.href = "/login.html"; }
const origFetch = window.fetch;
window.fetch = async function(url, opts = {}) {
  const headers = opts.headers || {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return origFetch(url, { ...opts, headers });
};

// ============ DOM REFS ============
const $ = id => document.getElementById(id);

const nom = $("nom");
const cognoms = $("cognoms");
const telefon = $("telefon");
const correu = $("correu");
const fechaNaixement = $("fechaNaixement");
const edad = $("edad");
const genere = $("genere");
const rol = $("rol");
const situacioEconomica = $("situacioEconomica");
const paisNaixement = $("paisNaixement");
const neses = $("neses");
const cursActual = $("cursActual");
const risc = $("risc");
const resulAcad = $("resulAcad");
const sebas = $("sebas");
const derivacio = $("derivacio");
const dataAlta = $("dataAlta");

const familiaName = $("familiaName");
const familiaDropdown = $("familiaDropdown");
const estructuraFamiliar = $("estructuraFamiliar");
const selectedFamilyInfo = $("selectedFamilyInfo");
const selectedFamilyName = $("selectedFamilyName");
const clearFamilyBtn = $("clearFamilyBtn");

const domiciliSearch = $("domiciliSearch");
const domiciliDropdown = $("domiciliDropdown");
const tipusVia = $("tipusVia");
const nomCalle = $("nomCalle");
const numCalle = $("numCalle");
const pis = $("pis");
const escala = $("escala");
const barriInput = $("barri");
const barriSelect = $("barriSelect");
const codiPostalInput = $("codiPostal");
const codiPostalSelect = $("codiPostalSelect");
const tipusDomicili = $("tipusDomicili");
const previewBar = $("previewBar");
const familyDomicilisGroup = $("familyDomicilisGroup");
const familyDomicilis = $("familyDomicilis");

const btnCrear = $("btnCrear");
const toast = $("toast");

// ============ STATE ============
let selectedFamilyId = null;
let selectedCallejeroId = null;
let selectedDomiciliId = null;
let debounceTimer = null;
let lastFamilyQuery = "";
let domiciliDebounce = null;
let lastDomiciliQuery = "";
let domiciliResults = [];
let familyDomiciles = [];
let lastFamiliaNameCheck = "";

// ============ HELPERS ============
function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

function calcEdad(fecha) {
  if (!fecha) return "";
  const nac = new Date(fecha);
  const avui = new Date();
  let e = avui.getFullYear() - nac.getFullYear();
  const m = avui.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) e--;
  return e;
}

// ============ LOAD DROPDOWNS ============
async function loadSelect(url, select, valueKey, labelKey) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const items = await res.json();
    for (const item of items) {
      const opt = document.createElement("option");
      opt.value = item[valueKey] ?? item.id;
      opt.textContent = item[labelKey] ?? item.Nom;
      select.appendChild(opt);
    }
  } catch {}
}

const DESPLEGABLES = {
  genere: "/desplegables/genere",
  rol: "/desplegables/rol",
  situacioEconomica: "/desplegables/situacio_eco",
  paisNaixement: "/paisos",
  neses: "/desplegables/neses",
  cursActual: "/desplegables/curso",
  risc: "/desplegables/risc",
  resulAcad: "/desplegables/resul_acad",
  sebas: "/desplegables/sebas",
  estructuraFamiliar: "/desplegables/estructura_familiar",
  tipusVia: "/desplegables/tipus_via",
  tipusDomicili: "/desplegables/tipus_domicili",
};

async function initDropdowns() {
  for (const [key, url] of Object.entries(DESPLEGABLES)) {
    const sel = $(key);
    if (sel) {
      if (key === "paisNaixement") {
        await loadSelect(url, sel, "idPais", "Nom_pais");
      } else {
        await loadSelect(url, sel);
      }
    }
  }
  setDefaultDropdowns();
}

function setDefaultDropdowns() {
  const selectDefault = (selId, search) => {
    const sel = $(selId);
    if (!sel) return;
    for (const opt of sel.options) {
      if (opt.textContent.toLowerCase().includes(search)) {
        sel.value = opt.value;
        return;
      }
    }
  };
  selectDefault("risc", "sense risc");
  selectDefault("sebas", "no sebas");
  selectDefault("cursActual", "no aplica");
  selectDefault("resulAcad", "no aplica");
  // NESE: find exact "No NESE"
  if (neses) {
    for (const opt of neses.options) {
      if (opt.textContent.trim() === "No NESE") {
        neses.value = opt.value;
        break;
      }
    }
  }
}

// ============ AGE CALCULATION ============
fechaNaixement.addEventListener("change", () => {
  edad.value = calcEdad(fechaNaixement.value);
});

// ============ DEFAULT DATE ============
dataAlta.value = new Date().toISOString().split("T")[0];

// ============ FAMILY NAME (integrated search + custom name) ============
// Sync familiaName from Cognoms on blur
cognoms.addEventListener("blur", () => {
  if (selectedFamilyId) return;
  const c = cognoms.value.trim();
  if (c.length >= 2) familiaName.value = c;
  if (c.length >= 2) triggerFamilySearch(c);
});

// Pre-fill when user types Cognoms
cognoms.addEventListener("input", () => {
  if (selectedFamilyId) return;
  familiaName.value = cognoms.value.trim();
});

familiaName.addEventListener("input", () => {
  if (selectedFamilyId) {
    clearFamily();
  }
  const q = familiaName.value.trim();
  if (q.length < 2) {
    familiaDropdown.style.display = "none";
    return;
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (q === lastFamilyQuery) return;
    lastFamilyQuery = q;
    triggerFamilySearch(q);
  }, 400);
});

function triggerFamilySearch(q) {
  if (q.length < 2) return;
  searchFamilies(q);
}

async function searchFamilies(q) {
  try {
    const res = await fetch(`/familia/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return;
    const items = await res.json();
    showFamilyDropdown(items);
  } catch {}
}

function showFamilyDropdown(items) {
  familiaDropdown.innerHTML = "";
  if (items.length === 0) {
    familiaDropdown.style.display = "none";
    return;
  }
  for (const item of items) {
    const div = document.createElement("div");
    div.dataset.id = item.idFamilia;
    div.textContent = `${item.Cognom_familiar} (ID: ${item.idFamilia})`;
    div.addEventListener("click", () => selectFamily(item));
    familiaDropdown.appendChild(div);
  }
  familiaDropdown.style.display = "block";
}

function selectFamily(item) {
  selectedFamilyId = item.idFamilia;
  selectedFamilyName.textContent = `${item.Cognom_familiar} (ID: ${item.idFamilia})`;
  selectedFamilyInfo.style.display = "flex";
  familiaName.value = item.Cognom_familiar;
  familiaDropdown.style.display = "none";
  estructuraFamiliar.value = item.Estructura_familiar || "";
  estructuraFamiliar.disabled = true;
  loadFamilyDomiciles(item.idFamilia);
}

clearFamilyBtn.addEventListener("click", clearFamily);

function clearFamily() {
  selectedFamilyId = null;
  selectedFamilyInfo.style.display = "none";
  selectedFamilyName.textContent = "";
  familiaName.value = "";
  estructuraFamiliar.disabled = false;
  estructuraFamiliar.value = "";
  familyDomicilisGroup.style.display = "none";
  familyDomicilis.innerHTML = '<option value="">Domicilis de la família</option>';
  familyDomiciles = [];
  if (domiciliSearch.value.trim().length >= 3) {
    triggerDomiciliSearch();
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".familia-search-wrap")) {
    familiaDropdown.style.display = "none";
  }
  if (!e.target.closest(".domicili-search-wrap")) {
    domiciliDropdown.style.display = "none";
  }
});

// ============ FAMILY DOMICILES ============
async function loadFamilyDomiciles(idFamilia) {
  try {
    const res = await fetch(`/domicili/byFamily/${idFamilia}`);
    if (!res.ok) return;
    familyDomiciles = await res.json();
    familyDomicilis.innerHTML = '<option value="">Domicilis de la família</option>';
    for (const d of familyDomiciles) {
      const opt = document.createElement("option");
      opt.value = d.idDomicili;
      const addr = [d.tipus_via, d.Nom_calle, d.Num_calle].filter(Boolean).join(" ");
      opt.textContent = `${addr} ${d.Pis ? `Pis ${d.Pis}` : ""} ${d.Escala ? `Esc ${d.Escala}` : ""} - ${d.barri} (${d.codi_postal})`.trim();
      familyDomicilis.appendChild(opt);
    }
    familyDomicilisGroup.style.display = "block";
    // Auto-fill domicile search with first domicile
    if (familyDomiciles.length > 0) {
      const first = familyDomiciles[0];
      domiciliSearch.value = first.Nom_complet;
      // Trigger search to show results
      triggerDomiciliSearch();
    }
  } catch {}
}

familyDomicilis.addEventListener("change", () => {
  const val = familyDomicilis.value;
  if (!val) return;
  const dom = familyDomiciles.find(d => d.idDomicili == val);
  if (dom) {
    domiciliSearch.value = dom.Nom_complet;
    triggerDomiciliSearch();
  }
});

// ============ UNIFIED DOMICILE SEARCH ============
domiciliSearch.addEventListener("input", () => {
  const q = domiciliSearch.value.trim();
  if (q.length < 3) {
    domiciliDropdown.style.display = "none";
    return;
  }
  clearTimeout(domiciliDebounce);
  domiciliDebounce = setTimeout(() => {
    if (q === lastDomiciliQuery) return;
    lastDomiciliQuery = q;
    triggerDomiciliSearch();
  }, 400);
});

function triggerDomiciliSearch() {
  const q = domiciliSearch.value.trim();
  if (q.length < 3) return;
  let url = `/domicili/search?q=${encodeURIComponent(q)}`;
  if (selectedFamilyId) {
    url += `&idFamilia=${selectedFamilyId}`;
  }
  fetchDomicili(url);
}

async function fetchDomicili(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    domiciliResults = await res.json();
    showDomiciliDropdown(domiciliResults);
    autoFillBarriCp(domiciliResults);
  } catch {}
}

function showDomiciliDropdown(results) {
  domiciliDropdown.innerHTML = "";
  if (results.length === 0) {
    domiciliDropdown.style.display = "none";
    return;
  }
  for (const r of results) {
    const div = document.createElement("div");
    if (r._type === "domicili") {
      let label = r.Nom_complet;
      if (r.Num_calle) label += `, ${r.Num_calle}`;
      if (r.Pis) label += `, Pis ${r.Pis}`;
      if (r.Escala) label += `, Esc ${r.Escala}`;
      div.innerHTML = `${label} <small>Domicili existent</small>`;
    } else {
      let label = r.Nom_complet;
      div.innerHTML = `${label} <small>Carrer</small>`;
      if (r.barri || r.codi_postal) {
        const small = document.createElement("small");
        small.textContent = [r.barri, r.codi_postal].filter(Boolean).join(" · ");
        div.appendChild(small);
      }
    }
    div.addEventListener("click", () => selectDomiciliResult(r));
    domiciliDropdown.appendChild(div);
  }
  domiciliDropdown.style.display = "block";
}

function selectDomiciliResult(r) {
  domiciliDropdown.style.display = "none";
  lastDomiciliQuery = r.Nom_complet;
  domiciliSearch.value = r.Nom_complet;

  if (r._type === "domicili") {
    selectedDomiciliId = r.idDomicili;
    selectedCallejeroId = null;
    tipusVia.value = r.idTipus_via || "";
    nomCalle.value = r.Nom_calle || "";
    numCalle.value = r.Num_calle || "";
    pis.value = r.Pis || "";
    escala.value = r.Escala || "";
    tipusDomicili.value = r.Tipus_domicili || "";
    setDomicileEditState(true);
    clearBarriCpHighlight();
    setBarriCpValue(r.barri, r.codi_postal);
  } else {
    selectedCallejeroId = r.idcallejero;
    selectedDomiciliId = null;
    tipusVia.value = r.idTipus_via || "";
    nomCalle.value = r.Nom_calle || "";
    tipusDomicili.value = tipusDomicili.value || "";
    setDomicileEditState(false);
    clearBarriCpHighlight();
    setBarriCpValue(r.barri, r.codi_postal);
  }
  updatePreview(r);
}

function setDomicileEditState(readonly) {
  const fields = [numCalle, pis, escala];
  for (const f of fields) {
    f.readOnly = readonly;
    f.style.background = readonly ? "#f0f0f0" : "#fff";
  }
}

function setBarriCpValue(barriVal, cpVal) {
  const allBarris = [...new Set(domiciliResults.map(r => r.barri).filter(Boolean))];
  const allCps = [...new Set(domiciliResults.map(r => r.codi_postal).filter(Boolean))];

  if (allBarris.length <= 1) {
    barriInput.value = barriVal || "";
    barriInput.style.display = "block";
    barriSelect.style.display = "none";
  } else {
    barriInput.style.display = "none";
    barriSelect.style.display = "block";
    barriSelect.innerHTML = '<option value="">-- Selecciona barri --</option>';
    for (const b of allBarris) {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      if (b === barriVal) opt.selected = true;
      barriSelect.appendChild(opt);
    }
    if (!allBarris.includes(barriVal)) {
      highlightAmbiguity("barri");
    }
  }

  if (allCps.length <= 1) {
    codiPostalInput.value = cpVal || "";
    codiPostalInput.style.display = "block";
    codiPostalSelect.style.display = "none";
  } else {
    codiPostalInput.style.display = "none";
    codiPostalSelect.style.display = "block";
    codiPostalSelect.innerHTML = '<option value="">-- Selecciona CP --</option>';
    for (const cp of allCps) {
      const opt = document.createElement("option");
      opt.value = cp;
      opt.textContent = cp;
      if (cp === cpVal) opt.selected = true;
      codiPostalSelect.appendChild(opt);
    }
    if (!allCps.includes(cpVal)) {
      highlightAmbiguity("codiPostal");
    }
  }
}

function highlightAmbiguity(field) {
  const el = field === "barri" ? barriInput : codiPostalInput;
  el.style.borderColor = "#e94560";
  el.style.boxShadow = "0 0 0 2px rgba(233,69,96,0.25)";
}

function clearBarriCpHighlight() {
  barriInput.style.borderColor = "";
  barriInput.style.boxShadow = "";
  codiPostalInput.style.borderColor = "";
  codiPostalInput.style.boxShadow = "";
}

function autoFillBarriCp(results) {
  if (results.length === 0) {
    barriInput.value = "";
    codiPostalInput.value = "";
    return;
  }
  const allBarris = [...new Set(results.map(r => r.barri).filter(Boolean))];
  const allCps = [...new Set(results.map(r => r.codi_postal).filter(Boolean))];
  clearBarriCpHighlight();

  if (allBarris.length === 1) {
    barriInput.value = allBarris[0];
    barriInput.style.display = "block";
    barriSelect.style.display = "none";
  } else if (allBarris.length > 1) {
    barriInput.style.display = "none";
    barriSelect.style.display = "block";
    barriSelect.innerHTML = '<option value="">-- Selecciona barri --</option>';
    for (const b of allBarris) {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      barriSelect.appendChild(opt);
    }
    highlightAmbiguity("barri");
  }

  if (allCps.length === 1) {
    codiPostalInput.value = allCps[0];
    codiPostalInput.style.display = "block";
    codiPostalSelect.style.display = "none";
  } else if (allCps.length > 1) {
    codiPostalInput.style.display = "none";
    codiPostalSelect.style.display = "block";
    codiPostalSelect.innerHTML = '<option value="">-- Selecciona CP --</option>';
    for (const cp of allCps) {
      const opt = document.createElement("option");
      opt.value = cp;
      opt.textContent = cp;
      codiPostalSelect.appendChild(opt);
    }
    highlightAmbiguity("codiPostal");
  }
}

function updatePreview(r) {
  if (!r) {
    previewBar.textContent = "";
    return;
  }
  const parts = [];
  if (r.tipus_via) parts.push(`(${r.tipus_via})`);
  if (r.Nom_complet) parts.push(r.Nom_complet);
  if (r.barri) parts.push(`[${r.barri}]`);
  if (r.codi_postal) parts.push(`<${r.codi_postal}>`);
  if (r._type === "domicili") parts.push("(Ja existeix)");
  previewBar.textContent = parts.join(" ") || "";
}

// ============ SUBMIT ============
btnCrear.addEventListener("click", submitForm);

async function submitForm() {
  if (!nom.value.trim()) { showToast("El camp Nom és obligatori", "error"); nom.focus(); return; }
  if (!cognoms.value.trim()) { showToast("El camp Cognoms és obligatori", "error"); cognoms.focus(); return; }
  if (!fechaNaixement.value) { showToast("La data de naixement és obligatòria", "error"); fechaNaixement.focus(); return; }
  if (!genere.value) { showToast("El gènere és obligatori", "error"); genere.focus(); return; }
  if (!rol.value) { showToast("El rol és obligatori", "error"); rol.focus(); return; }
  if (!situacioEconomica.value) { showToast("La situació econòmica és obligatòria", "error"); situacioEconomica.focus(); return; }
  if (!paisNaixement.value) { showToast("El país de naixement és obligatori", "error"); paisNaixement.focus(); return; }

  if (!selectedFamilyId && !estructuraFamiliar.value) {
    showToast("Cal seleccionar una família o indicar l'estructura familiar", "error");
    estructuraFamiliar.focus();
    return;
  }

  // Build domicili payload
  let domiciliPayload;
  if (selectedDomiciliId) {
    domiciliPayload = { idDomicili: selectedDomiciliId };
  } else if (selectedCallejeroId) {
    const finalBarri = barriSelect.style.display !== "none" && barriSelect.value
      ? barriSelect.value
      : barriInput.value;
    const finalCp = codiPostalSelect.style.display !== "none" && codiPostalSelect.value
      ? codiPostalSelect.value
      : codiPostalInput.value;
    domiciliPayload = {
      idcallejero: selectedCallejeroId,
      Num_calle: numCalle.value.trim(),
      Pis: pis.value.trim() || null,
      Escala: escala.value.trim() || null,
      Tipus_domicili: tipusDomicili.value ? parseInt(tipusDomicili.value) : 1,
      barri: finalBarri || null,
      codi_postal: finalCp || null,
    };
  }

  const payload = {
    client: {
      Nom: nom.value.trim(),
      Cognoms: cognoms.value.trim(),
      Telefon: telefon.value.trim() || null,
      Correu_electronic: correu.value.trim() || null,
      Fecha_nacimiento: fechaNaixement.value,
      Data_d_alta: dataAlta.value || new Date().toISOString().split("T")[0],
      idGenere: parseInt(genere.value),
      idRol: parseInt(rol.value),
      idSituacio_economica: parseInt(situacioEconomica.value),
      Pais_naixement: parseInt(paisNaixement.value),
      Risc: risc.value ? parseInt(risc.value) : undefined,
      Resultat_academic: resulAcad.value ? parseInt(resulAcad.value) : undefined,
      Curs_actual: cursActual.value ? parseInt(cursActual.value) : undefined,
      idSebas: sebas.value ? parseInt(sebas.value) : undefined,
      idNecessitat_especial: neses.value ? parseInt(neses.value) : null,
      derivacio_serveis_socials: derivacio.checked ? 1 : 0,
    },
    familia: selectedFamilyId
      ? { idFamilia: selectedFamilyId }
      : {
          Cognom_familiar: familiaName.value.trim() || cognoms.value.trim(),
          Estructura_familiar: parseInt(estructuraFamiliar.value)
        },
    domicili: domiciliPayload,
  };

  btnCrear.disabled = true;
  btnCrear.textContent = "Creant...";

  try {
    const res = await fetch("/client/full", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Client creat correctament (ID: ${data.id})`, "success");
      resetForm();
    } else {
      showToast(data.message || "Error creant client", "error");
    }
  } catch {
    showToast("Error de connexió", "error");
  } finally {
    btnCrear.disabled = false;
    btnCrear.textContent = "CREAR";
  }
}

function resetForm() {
  nom.value = "";
  cognoms.value = "";
  cognoms.style.borderColor = "";
  cognoms.style.boxShadow = "";
  telefon.value = "";
  correu.value = "";
  fechaNaixement.value = "";
  edad.value = "";
  genere.value = "";
  rol.value = "";
  situacioEconomica.value = "";
  paisNaixement.value = "";
  setDefaultDropdowns();
  derivacio.checked = false;
  dataAlta.value = new Date().toISOString().split("T")[0];
  clearFamily();
  clearDomicile();
}

function clearDomicile() {
  domiciliSearch.value = "";
  domiciliDropdown.style.display = "none";
  tipusVia.value = "";
  nomCalle.value = "";
  numCalle.value = "";
  numCalle.readOnly = false;
  numCalle.style.background = "#fff";
  pis.value = "";
  pis.readOnly = false;
  pis.style.background = "#fff";
  escala.value = "";
  escala.readOnly = false;
  escala.style.background = "#fff";
  barriInput.value = "";
  barriInput.style.display = "block";
  barriInput.style.borderColor = "";
  barriInput.style.boxShadow = "";
  barriSelect.style.display = "none";
  codiPostalInput.value = "";
  codiPostalInput.style.display = "block";
  codiPostalInput.style.borderColor = "";
  codiPostalInput.style.boxShadow = "";
  codiPostalSelect.style.display = "none";
  tipusDomicili.value = "";
  selectedCallejeroId = null;
  selectedDomiciliId = null;
  domiciliResults = [];
  previewBar.textContent = "";
}

// ============ INIT ============
initDropdowns();
