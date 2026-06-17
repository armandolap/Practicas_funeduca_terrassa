const REPORTS = [
  { label: "Projectes/Gènere-Edat", endpoint: "projectes/generesEdats" },
  { label: "Gènere", endpoint: "genere" },
  { label: "Sit. Econòmica", endpoint: "sitEco" },
  { label: "Rol Familiar", endpoint: "rolFam" },
  { label: "Tipus Habitatge", endpoint: "tipHab" },
  { label: "Comptadors", endpoint: "cont" },
  { label: "NESE", endpoint: "neses" },
  { label: "SEBAS/Deriv.", endpoint: "sebasDev" },
  { label: "Curs Actual", endpoint: "cursAny", needsYear: true },
  { label: "Res. Acadèmic", endpoint: "resAcad" },
  { label: "Motius Baixa", endpoint: "motiusBaixa" },
  { label: "Riscos", endpoint: "riscos" },
  { label: "Països", endpoint: "països" },
];

const btnContainer = document.getElementById("reportButtons");
const thead = document.getElementById("theadInforme");
const tbody = document.getElementById("tbodyInforme");
const reportTitle = document.getElementById("reportTitle");
const toast = document.getElementById("toast");

let currentData = null;
let currentEndpoint = null;

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

for (const r of REPORTS) {
  const btn = document.createElement("button");
  btn.className = "btn btn-outline btn-sm";
  btn.textContent = r.label;
  btn.dataset.endpoint = r.endpoint;
  if (r.needsYear) btn.dataset.needsYear = "1";
  btn.addEventListener("click", () => fetchReport(r));
  btnContainer.appendChild(btn);
}

async function fetchReport(r) {
  let url = `/reports/${r.endpoint}`;
  if (r.needsYear) {
    const any = prompt("Introdueix l'any:", new Date().getFullYear());
    if (!any || !/^\d{4}$/.test(any)) { showToast("Any no vàlid", "error"); return; }
    url = `/reports/${r.endpoint}/${any}`;
  }
  currentEndpoint = r.endpoint;
  reportTitle.textContent = r.label;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error");
    let data = await res.json();
    if (!Array.isArray(data)) data = [data];
    currentData = data;
    renderTable(data);
  } catch {
    showToast("Error carregant informe", "error");
  }
}

function renderTable(data) {
  thead.innerHTML = "";
  tbody.innerHTML = "";
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td class="text-center">Sense dades</td></tr>';
    return;
  }
  const keys = Object.keys(data[0]);
  const trHead = document.createElement("tr");
  for (const k of keys) {
    const th = document.createElement("th");
    th.textContent = k;
    trHead.appendChild(th);
  }
  thead.appendChild(trHead);
  for (const row of data) {
    const tr = document.createElement("tr");
    for (const k of keys) {
      const td = document.createElement("td");
      td.textContent = row[k] != null ? row[k] : "";
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function tableToCsv(data) {
  if (!data || data.length === 0) return "";
  const keys = Object.keys(data[0]);
  const escape = v => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [keys.map(escape).join(",")];
  for (const row of data) {
    lines.push(keys.map(k => escape(row[k])).join(","));
  }
  return lines.join("\n");
}

function downloadCsv(content, filename) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;bom:true" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById("btnExportCsv").addEventListener("click", () => {
  if (!currentData || currentData.length === 0) { showToast("No hi ha dades per exportar", "warning"); return; }
  const csv = tableToCsv(currentData);
  downloadCsv(csv, `informe_${currentEndpoint || "desconegut"}.csv`);
  showToast("Exportat correctament", "success");
});

document.getElementById("btnExportTots").addEventListener("click", async () => {
  const parts = [];
  for (const r of REPORTS) {
    try {
      let url = `/reports/${r.endpoint}`;
      if (r.needsYear) {
        const any = new Date().getFullYear();
        url = `/reports/${r.endpoint}/${any}`;
      }
      const res = await fetch(url);
      if (!res.ok) continue;
      let data = await res.json();
      if (!Array.isArray(data)) data = [data];
      parts.push(`=== ${r.label} ===`);
      parts.push(tableToCsv(data));
      parts.push("");
    } catch {}
  }
  const csv = parts.join("\n");
  downloadCsv(csv, `tots_informes.csv`);
  showToast("Tots els informes exportats", "success");
});
