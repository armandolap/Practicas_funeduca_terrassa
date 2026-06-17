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

const btnCrear = $("btnCrear");
const toast = $("toast");

// ============ STATE ============
let selectedFamilyId = null;
let selectedCallejeroId = null;
let selectedDomiciliId = null;
let domicileType = null; // "callejero" | "domicili"
let debounceTimer = null;
let lastFamilyQuery = "";
let domiciliDebounce = null;
let lastDomiciliQuery = "";
let domiciliResults = [];

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
  // Risc → "Sense risc"
  if (risc) {
    for (const opt of risc.options) {
      if (opt.textContent.toLowerCase().includes("sense risc")) {
        risc.value = opt.value;
        break;
      }
    }
  }
  // Sebas → "No SEBAS"
  if (sebas) {
    for (const opt of sebas.options) {
      if (opt.textContent.toLowerCase().includes("no sebas")) {
        sebas.value = opt.value;
        break;
      }
    }
  }
  // Curs actual → "No aplica"
  if (cursActual) {
    for (const opt of cursActual.options) {
      if (opt.textContent.toLowerCase().includes("no aplica")) {
        cursActual.value = opt.value;
        break;
      }
    }
  }
  // Resultat academic → "No aplica"
  if (resulAcad) {
    for (const opt of resulAcad.options) {
      if (opt.textContent.toLowerCase().includes("no aplica")) {
        resulAcad.value = opt.value;
        break;
      }
    }
  }
  // NESE → "No neses"
  if (neses) {
    for (let i = 0; i < neses.options.length; i++) {
      if (neses.options[i].textContent.toLowerCase().includes("no neses")) {
        neses.options[i].selected = true;
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
  // Re-trigger domicile search to include family domiciles
  if (domiciliSearch.value.trim().length >= 3) {
    triggerDomiciliSearch();
  }
}

clearFamilyBtn.addEventListener("click", clearFamily);

function clearFamily() {
  selectedFamilyId = null;
  selectedFamilyInfo.style.display = "none";
  selectedFamilyName.textContent = "";
  familiaSearch.value = "";
  estructuraFamiliar.disabled = false;
  estructuraFamiliar.value = "";
  // Re-trigger domicile search to exclude family domiciles
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
      // Existing domicile
      let label = `📍 ${r.Nom_complet}`;
      if (r.Num_calle) label += `, ${r.Num_calle}`;
      if (r.Pis) label += `, Pis ${r.Pis}`;
      if (r.Escala) label += `, Esc ${r.Escala}`;
      div.innerHTML = `${label} <small>Domicili existent</small>`;
    } else {
      // Callejero result
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
  domicileType = r._type;

  if (r._type === "domicili") {
    // Reusing an existing domicile
    selectedDomiciliId = r.idDomicili;
    selectedCallejeroId = null;
    tipusVia.value = r.idTipus_via || "";
    nomCalle.value = r.Nom_calle || "";
    numCalle.value = r.Num_calle || "";
    pis.value = r.Pis || "";
    escala.value = r.Escala || "";
    tipusDomicili.value = r.Tipus_domicili || "";
    // Disable address editing since we're reusing
    setDomicileEditState(true);
    setBarriCpValue(r.barri, r.codi_postal);
    updatePreview(r);
  } else {
    // New address from callejero catalog
    selectedCallejeroId = r.idcallejero;
    selectedDomiciliId = null;
    tipusVia.value = r.idTipus_via || "";
    nomCalle.value = r.Nom_calle || "";
    // Don't touch num/pis/escala - user must enter them
    tipusDomicili.value = tipusDomicili.value || "";
    setDomicileEditState(false);
    setBarriCpValue(r.barri, r.codi_postal);
    updatePreview(r);
  }
}

function setDomicileEditState(readonly) {
  const fields = [numCalle, pis, escala];
  for (const f of fields) {
    f.readOnly = readonly;
    f.style.background = readonly ? "#f0f0f0" : "#fff";
  }
}

function setBarriCpValue(barriVal, cpVal) {
  // Collect unique barri/CP from current results
  const barris = [...new Set(domiciliResults.map(r => r.barri).filter(Boolean))];
  const cps = [...new Set(domiciliResults.map(r => r.codi_postal).filter(Boolean))];

  if (barris.length <= 1) {
    barriInput.value = barriVal || "";
    barriInput.style.display = "block";
    barriSelect.style.display = "none";
  } else {
    showBarriDisambiguation(barris);
  }

  if (cps.length <= 1) {
    codiPostalInput.value = cpVal || "";
    codiPostalInput.style.display = "block";
    codiPostalSelect.style.display = "none";
  } else {
    showCpDisambiguation(cps);
  }
}

function showBarriDisambiguation(barris) {
  barriInput.style.display = "none";
  barriSelect.style.display = "block";
  barriSelect.innerHTML = '<option value="">-- Selecciona barri --</option>';
  for (const b of barris) {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    barriSelect.appendChild(opt);
  }
  barriSelect.value = "";
}

function showCpDisambiguation(cps) {
  codiPostalInput.style.display = "none";
  codiPostalSelect.style.display = "block";
  codiPostalSelect.innerHTML = '<option value="">-- Selecciona CP --</option>';
  for (const cp of cps) {
    const opt = document.createElement("option");
    opt.value = cp;
    opt.textContent = cp;
    codiPostalSelect.appendChild(opt);
  }
  codiPostalSelect.value = "";
}

function autoFillBarriCp(results) {
  if (results.length === 0) {
    barriInput.value = "";
    codiPostalInput.value = "";
    return;
  }
  const allBarris = results.map(r => r.barri).filter(Boolean);
  const allCps = results.map(r => r.codi_postal).filter(Boolean);
  const uniqueBarris = [...new Set(allBarris)];
  const uniqueCps = [...new Set(allCps)];

  if (uniqueBarris.length === 1) {
    barriInput.value = uniqueBarris[0];
    barriInput.style.display = "block";
    barriSelect.style.display = "none";
  } else if (uniqueBarris.length > 1) {
    showBarriDisambiguation(uniqueBarris);
  }

  if (uniqueCps.length === 1) {
    codiPostalInput.value = uniqueCps[0];
    codiPostalInput.style.display = "block";
    codiPostalSelect.style.display = "none";
  } else if (uniqueCps.length > 1) {
    showCpDisambiguation(uniqueCps);
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
  const neseOptions = [...neses.selectedOptions].map(o => parseInt(o.value)).filter(n => !isNaN(n));

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
    domicili: domiciliPayload,
    necessitats_especials: neseOptions,
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
  telefon.value = "";
  correu.value = "";
  fechaNaixement.value = "";
  edad.value = "";
  genere.value = "";
  rol.value = "";
  situacioEconomica.value = "";
  paisNaixement.value = "";
  // Reset multi-select
  for (const opt of neses.options) opt.selected = false;
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
  barriSelect.style.display = "none";
  codiPostalInput.value = "";
  codiPostalInput.style.display = "block";
  codiPostalSelect.style.display = "none";
  tipusDomicili.value = "";
  selectedCallejeroId = null;
  selectedDomiciliId = null;
  domicileType = null;
  domiciliResults = [];
  previewBar.textContent = "";
}

// ============ INIT ============
initDropdowns();
