(function() {
  const tok = localStorage.getItem("token");
  if (tok) {
    try {
      const role = JSON.parse(atob(tok.split('.')[1])).idNivel_acceso;
      if (role !== 1) { window.location.href = "/projectes.html"; return; }
    } catch(e) { window.location.href = "/login.html"; return; }
  }
})();

const ENTITY_MAP = {
  estructura_familiar: { endpoint: "estFamilia", createDelete: false },
  pais: { endpoint: "paisos", createDelete: false },
  sebas: { endpoint: "sebas", createDelete: false },
  motiu_baixa: { endpoint: "motiuBaixa", createDelete: false },
  risc: { endpoint: "risc", createDelete: false },
  genere: { endpoint: null, createDelete: false },
  rol: { endpoint: "rol", createDelete: false },
  situacio_economica: { endpoint: "sitEco", createDelete: false },
  neses: { endpoint: "NESES", createDelete: true },
  curs_actual: { endpoint: "curso", createDelete: true },
  resul_acad: { endpoint: "resulAcad", createDelete: false },
  tipus_domicili: { endpoint: "tipusDom", createDelete: false },
  barri: { endpoint: "barri", createDelete: true },
  codi_postal: { endpoint: "codiPostal", createDelete: true },
  tipus_via: { endpoint: "tipusVia", createDelete: true },
  Nivel_acceso: { endpoint: null, createDelete: false },
};

const LABELS = {
  estructura_familiar: "Estructura Familiar",
  pais: "País",
  sebas: "SEBAS",
  motiu_baixa: "Motiu Baixa",
  risc: "Risc",
  genere: "Gènere",
  rol: "Rol",
  situacio_economica: "Situació Econòmica",
  neses: "NESE",
  curs_actual: "Curs Actual",
  resul_acad: "Resultat Acadèmic",
  tipus_domicili: "Tipus Domicili",
  barri: "Barri",
  codi_postal: "Codi Postal",
  tipus_via: "Tipus Via",
  Nivel_acceso: "Nivell Accés",
};

const $ = id => document.getElementById(id);
const selectTaula = $("selectTaula");
const thead = $("theadConfig");
const tbody = $("tbodyConfig");
const btnAfegir = $("btnAfegir");
const toast = $("toast");
let currentEntity = null;
let currentData = [];

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

for (const [key, label] of Object.entries(LABELS)) {
  if (key === "Nivel_acceso") continue;
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = label;
  selectTaula.appendChild(opt);
}

btnAfegir.style.display = "none";

async function loadTable() {
  const entity = selectTaula.value;
  if (!entity) return;
  currentEntity = entity;
  try {
    const res = await fetch(`/desplegables/${entity}`);
    if (!res.ok) throw new Error("Error");
    const items = await res.json();
    currentData = items;
    renderConfig(items, entity);
  } catch {
    showToast("Error carregant dades", "error");
  }
}

function renderConfig(items, entity) {
  thead.innerHTML = "";
  tbody.innerHTML = "";
  const info = ENTITY_MAP[entity];
  const canEdit = info && info.createDelete;

  btnAfegir.style.display = canEdit ? "inline-flex" : "none";

  const trHead = document.createElement("tr");
  const thId = document.createElement("th");
  thId.textContent = "ID";
  trHead.appendChild(thId);
  const thNom = document.createElement("th");
  thNom.textContent = "Nom";
  trHead.appendChild(thNom);
  if (canEdit) {
    const thAcc = document.createElement("th");
    thAcc.textContent = "Accions";
    trHead.appendChild(thAcc);
  }
  thead.appendChild(trHead);

  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Sense registres</td></tr>';
    return;
  }

  for (const item of items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.id}</td><td>${item.Nom}</td>`;
    if (canEdit) {
      const td = document.createElement("td");
      const btnDel = document.createElement("button");
      btnDel.className = "btn btn-danger btn-sm";
      btnDel.textContent = "Eliminar";
      btnDel.addEventListener("click", () => deleteItem(entity, item.id, info.endpoint));
      td.appendChild(btnDel);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

async function deleteItem(entity, id, endpoint) {
  if (!confirm(`Eliminar registre #${id}?`)) return;
  try {
    const res = await fetch(`/${endpoint}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Error en eliminar");
    }
    showToast("Registre eliminat", "success");
    loadTable();
  } catch (err) {
    showToast(err.message, "error");
  }
}

btnAfegir.addEventListener("click", async () => {
  const nom = prompt("Nom del nou registre:");
  if (!nom || !nom.trim()) return;
  const entity = currentEntity;
  const info = ENTITY_MAP[entity];
  if (!info || !info.createDelete || !info.endpoint) return;
  try {
    const res = await fetch(`/${info.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nom: nom.trim() }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Error en crear");
    }
    showToast("Registre creat", "success");
    loadTable();
  } catch (err) {
    showToast(err.message, "error");
  }
});

$("btnCarregar").addEventListener("click", loadTable);
