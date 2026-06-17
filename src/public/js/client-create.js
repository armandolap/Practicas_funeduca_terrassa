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

const familiaSearch = $("familiaSearch");
const familiaDropdown = $("familiaDropdown");
const estructuraFamiliar = $("estructuraFamiliar");
const selectedFamilyInfo = $("selectedFamilyInfo");
const selectedFamilyName = $("selectedFamilyName");
const clearFamilyBtn = $("clearFamilyBtn");

const tipusVia = $("tipusVia");
const nomCalle = $("nomCalle");
const callejeroDropdown = $("callejeroDropdown");
const numCalle = $("numCalle");
const pis = $("pis");
const escala = $("escala");
const barri = $("barri");
const codiPostal = $("codiPostal");
const tipusDomicili = $("tipusDomicili");
const familyDomicilisGroup = $("familyDomicilisGroup");
const familyDomicilis = $("familyDomicilis");
const previewBar = $("previewBar");

const btnCrear = $("btnCrear");
const toast = $("toast");

// ============ STATE ============
let selectedFamilyId = null;
let selectedCallejeroId = null;
let selectedFamilyDomiciliId = null;
let familyDomiciles = [];
let debounceTimer = null;
let lastFamilyQuery = "";

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
}

// ============ AGE CALCULATION ============
fechaNaixement.addEventListener("change", () => {
  edad.value = calcEdad(fechaNaixement.value);
});

// ============ DEFAULT DATE ============
dataAlta.value = new Date().toISOString().split("T")[0];

// ============ FAMILY SEARCH ============
familiaSearch.addEventListener("input", () => {
  const q = familiaSearch.value.trim();
  if (q.length < 2) {
    familiaDropdown.style.display = "none";
    return;
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (q === lastFamilyQuery) return;
    lastFamilyQuery = q;
    await searchFamilies(q);
  }, 400);
});

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
    div.textContent = item.Cognom_familiar;
    div.addEventListener("click", () => selectFamily(item));
    familiaDropdown.appendChild(div);
  }
  familiaDropdown.style.display = "block";
}

function selectFamily(item) {
  selectedFamilyId = item.idFamilia;
  selectedFamilyName.textContent = `${item.Cognom_familiar} (ID: ${item.idFamilia})`;
  selectedFamilyInfo.style.display = "flex";
  familiaSearch.value = item.Cognom_familiar;
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
  familiaSearch.value = "";
  estructuraFamiliar.disabled = false;
  estructuraFamiliar.value = "";
  familyDomicilisGroup.style.display = "none";
  familyDomicilis.innerHTML = '<option value="">-- Selecciona un domicili existent --</option>';
  selectedFamilyDomiciliId = null;
  familyDomiciles = [];
  enableCallejeroSearch();
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".familia-search-wrap")) {
    familiaDropdown.style.display = "none";
  }
});

// ============ FAMILY DOMICILES ============
async function loadFamilyDomiciles(idFamilia) {
  try {
    const res = await fetch(`/domicili/byFamily/${idFamilia}`);
    if (!res.ok) return;
    familyDomiciles = await res.json();
    familyDomicilis.innerHTML = '<option value="">-- Selecciona un domicili existent --</option>';
    for (const d of familyDomiciles) {
      const opt = document.createElement("option");
      opt.value = d.idDomicili;
      const addr = [d.tipus_via_nom, d.Nom_calle, d.Num_calle].filter(Boolean).join(" ");
      opt.textContent = `${addr} ${d.Pis ? `Pis ${d.Pis}` : ""} ${d.Escala ? `Esc ${d.Escala}` : ""} - ${d.barri_nom} (${d.codi_postal})`.trim();
      familyDomicilis.appendChild(opt);
    }
    familyDomicilisGroup.style.display = "block";
  } catch {}
}

familyDomicilis.addEventListener("change", () => {
  const val = familyDomicilis.value;
  if (!val) {
    selectedFamilyDomiciliId = null;
    enableCallejeroSearch();
    return;
  }
  selectedFamilyDomiciliId = parseInt(val);
  const dom = familyDomiciles.find(d => d.idDomicili === selectedFamilyDomiciliId);
  if (dom) {
    fillDomicileFromExisting(dom);
  }
});

function fillDomicileFromExisting(dom) {
  tipusVia.value = dom.idTipus_via || "";
  nomCalle.value = dom.Nom_calle || "";
  numCalle.value = dom.Num_calle || "";
  pis.value = dom.Pis || "";
  escala.value = dom.Escala || "";
  barri.value = dom.barri_nom || "";
  codiPostal.value = dom.codi_postal || "";
  tipusDomicili.value = dom.Tipus_domicili || "";
  selectedCallejeroId = dom.idcallejero;
  disableCallejeroSearch();
  updatePreview();
}

function disableCallejeroSearch() {
  tipusVia.disabled = true;
  nomCalle.disabled = true;
  numCalle.disabled = true;
  pis.disabled = true;
  escala.disabled = true;
}

function enableCallejeroSearch() {
  tipusVia.disabled = false;
  nomCalle.disabled = false;
  numCalle.disabled = false;
  pis.disabled = false;
  escala.disabled = false;
  selectedCallejeroId = null;
  selectedFamilyDomiciliId = null;
}

// ============ CALLEJERO SEARCH ============
let callejeroDebounce = null;
let lastCallejeroQuery = "";
let callejeroResults = [];

tipusVia.addEventListener("change", onCallejeroFilter);
nomCalle.addEventListener("input", onCallejeroFilter);

function onCallejeroFilter() {
  const q = nomCalle.value.trim();
  if (q.length < 3) {
    callejeroDropdown.style.display = "none";
    barri.value = "";
    codiPostal.value = "";
    selectedCallejeroId = null;
    return;
  }
  clearTimeout(callejeroDebounce);
  callejeroDebounce = setTimeout(async () => {
    if (q === lastCallejeroQuery) return;
    lastCallejeroQuery = q;
    selectedCallejeroId = null;
    updatePreview();
    await fetchCallejero();
  }, 500);
}

async function fetchCallejero() {
  const tv = tipusVia.value;
  const q = nomCalle.value.trim();
  if (q.length < 3) return;
  let url = `/callejero?q=${encodeURIComponent(q)}`;
  if (tv) url += `&tipus_via=${encodeURIComponent(tv)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    callejeroResults = await res.json();
    showCallejeroDropdown(callejeroResults);
    autoFillCallejero(callejeroResults);
  } catch {}
}

function showCallejeroDropdown(results) {
  callejeroDropdown.innerHTML = "";
  if (results.length === 0) {
    callejeroDropdown.style.display = "none";
    return;
  }
  for (const r of results) {
    const div = document.createElement("div");
    div.textContent = r.Nom_complet;
    if (r.barri || r.codi_postal) {
      const small = document.createElement("small");
      small.textContent = [r.barri, r.codi_postal].filter(Boolean).join(" · ");
      div.appendChild(small);
    }
    div.addEventListener("click", () => selectCallejero(r));
    callejeroDropdown.appendChild(div);
  }
  callejeroDropdown.style.display = "block";
}

function selectCallejero(r) {
  nomCalle.value = r.Nom_complet;
  barri.value = r.barri || "";
  codiPostal.value = r.codi_postal || "";
  callejeroDropdown.style.display = "none";
  lastCallejeroQuery = r.Nom_complet;
  selectedCallejeroId = r.idDireccio || r.idcallejero;
  // If it has idcallejero, use that
  if (r.idcallejero) selectedCallejeroId = r.idcallejero;
  else if (r.idDireccio) selectedCallejeroId = r.idDireccio;
  updatePreview(r);
}

function autoFillCallejero(results) {
  if (results.length === 0) {
    barri.value = "";
    codiPostal.value = "";
    return;
  }
  const barris = new Set(results.map(r => r.barri).filter(Boolean));
  const cps = new Set(results.map(r => r.codi_postal).filter(Boolean));
  barri.value = barris.size === 1 ? [...barris][0] : "";
  codiPostal.value = cps.size === 1 ? [...cps][0] : "";
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
  previewBar.textContent = parts.join(" ") || "";
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".autocomplete-wrap") && !e.target.closest(".domicili-search-wrap")) {
    callejeroDropdown.style.display = "none";
  }
});

// ============ SUBMIT ============
btnCrear.addEventListener("click", submitForm);

async function submitForm() {
  const neseOptions = [...neses.selectedOptions].map(o => parseInt(o.value)).filter(n => !isNaN(n));

  // Validation
  if (!nom.value.trim()) { showToast("El camp Nom és obligatori", "error"); nom.focus(); return; }
  if (!cognoms.value.trim()) { showToast("El camp Cognoms és obligatori", "error"); cognoms.focus(); return; }
  if (!fechaNaixement.value) { showToast("La data de naixement és obligatòria", "error"); fechaNaixement.focus(); return; }
  if (!genere.value) { showToast("El gènere és obligatori", "error"); genere.focus(); return; }
  if (!rol.value) { showToast("El rol és obligatori", "error"); rol.focus(); return; }
  if (!situacioEconomica.value) { showToast("La situació econòmica és obligatòria", "error"); situacioEconomica.focus(); return; }
  if (!paisNaixement.value) { showToast("El país de naixement és obligatori", "error"); paisNaixement.focus(); return; }

  // Validate family or estructura_familiar
  if (!selectedFamilyId && !estructuraFamiliar.value) {
    showToast("Cal seleccionar una família o indicar l'estructura familiar", "error");
    estructuraFamiliar.focus();
    return;
  }

  // Payload
  const payload = {
    client: {
      Nom: nom.value.trim(),
      Cognoms: cognoms.value.trim(),
      Telefon: telefon.value.trim() || null,
      Correu_electronic: correu.value.trim() || null,
      Fecha_nacimiento: fechaNaixement.value,
      idGenere: parseInt(genere.value),
      idRol: parseInt(rol.value),
      idSituacio_economica: parseInt(situacioEconomica.value),
      Pais_naixement: parseInt(paisNaixement.value),
      Risc: risc.value ? parseInt(risc.value) : undefined,
      Resultat_academic: resulAcad.value ? parseInt(resulAcad.value) : undefined,
      Curs_actual: cursActual.value ? parseInt(cursActual.value) : undefined,
      idSebas: sebas.value ? parseInt(sebas.value) : undefined,
      derivacio_serveis_socials: derivacio.checked ? 1 : 0,
    },
    familia: selectedFamilyId
      ? { idFamilia: selectedFamilyId }
      : { Estructura_familiar: parseInt(estructuraFamiliar.value) },
    domicili: selectedFamilyDomiciliId
      ? { idDomicili: selectedFamilyDomiciliId }
      : {
          idcallejero: selectedCallejeroId,
          Num_calle: numCalle.value.trim(),
          Pis: pis.value.trim() || null,
          Escala: escala.value.trim() || null,
          Tipus_domicili: tipusDomicili.value ? parseInt(tipusDomicili.value) : 1,
        },
    necessitats_especials: neseOptions,
  };

  // If no domicile address was entered, don't send domicili data
  if (!selectedFamilyDomiciliId && !selectedCallejeroId) {
    delete payload.domicili;
  }

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
  telefon.value = "";
  correu.value = "";
  fechaNaixement.value = "";
  edad.value = "";
  genere.value = "";
  rol.value = "";
  situacioEconomica.value = "";
  paisNaixement.value = "";
  neses.selectedIndex = -1;
  cursActual.value = "";
  risc.value = "";
  resulAcad.value = "";
  sebas.value = "";
  derivacio.checked = false;
  dataAlta.value = new Date().toISOString().split("T")[0];
  clearFamily();
  clearDomicile();
}

function clearDomicile() {
  tipusVia.value = "";
  nomCalle.value = "";
  numCalle.value = "";
  pis.value = "";
  escala.value = "";
  barri.value = "";
  codiPostal.value = "";
  tipusDomicili.value = "";
  selectedCallejeroId = null;
  selectedFamilyDomiciliId = null;
  callejeroResults = [];
  callejeroDropdown.style.display = "none";
  previewBar.textContent = "";
  enableCallejeroSearch();
}

// ============ INIT ============
initDropdowns();
