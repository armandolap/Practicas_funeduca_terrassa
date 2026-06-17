const params = new URLSearchParams(window.location.search);
const id = params.get("id");
if (!id) { document.title = "Sense ID"; document.querySelector(".main-content").innerHTML = "<h1>ID no proporcionat</h1>"; }

const toast = document.getElementById("toast");

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

async function loadDomicili() {
  if (!id) return;
  try {
    const res = await fetch(`/domicili/${id}`);
    if (!res.ok) throw new Error("No trobat");
    const d = await res.json();
    render(d);
  } catch {
    showToast("Error carregant domicili", "error");
  }
}

function render(d) {
  document.getElementById("titolDomicili").textContent = `Domicili #${d.idDomicili}`;
  const info = document.getElementById("infoAdreca");
  const adrecaParts = [];
  if (d.tipus_via) adrecaParts.push(d.tipus_via);
  if (d.Nom_calle) adrecaParts.push(d.Nom_calle);
  if (d.Num_calle) adrecaParts.push(`núm. ${d.Num_calle}`);
  if (d.Pis) adrecaParts.push(`pis ${d.Pis}`);
  if (d.Escala) adrecaParts.push(`esc. ${d.Escala}`);
  info.innerHTML = `
    <dt>Adreça</dt><dd>${adrecaParts.join(" ") || "—"}</dd>
    <dt>Barri</dt><dd>${d.barri || "—"}</dd>
    <dt>Codi Postal</dt><dd>${d.codi_postal || "—"}</dd>
    <dt>Tipus domicili</dt><dd>${d.Nom_domicili || "—"}</dd>
  `;

  const tbodyP = document.getElementById("tbodyPersones");
  tbodyP.innerHTML = "";
  if (d.persones && d.persones.length > 0) {
    for (const p of d.persones) {
      const tr = document.createElement("tr");
      const estat = Number(p.estat) === 1 ? "Baixa" : "Actiu";
      const color = Number(p.estat) === 1 ? "badge badge-inactive" : "badge badge-active";
      tr.innerHTML = `
        <td>${p.Nom}</td>
        <td>${p.Cognoms}</td>
        <td>${p.Cognom_familiar || "—"}</td>
        <td><span class="${color}">${estat}</span></td>
        <td><a href="/client.html?id=${p.idClient}" class="btn btn-sm btn-outline">Veure</a></td>
      `;
      tbodyP.appendChild(tr);
    }
  } else {
    tbodyP.innerHTML = '<tr><td colspan="5" class="text-center">No hi ha persones</td></tr>';
  }

  const tbodyF = document.getElementById("tbodyFamilies");
  tbodyF.innerHTML = "";
  if (d.families && d.families.length > 0) {
    for (const f of d.families) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><a href="/familia.html?id=${f.idFamilia}">${f.Cognom_familiar}</a></td>
        <td>${f.num_membres}</td>
        <td>${f.Estructura_familiar || "—"}</td>
      `;
      tbodyF.appendChild(tr);
    }
  } else {
    tbodyF.innerHTML = '<tr><td colspan="3" class="text-center">No hi ha famílies</td></tr>';
  }

  const llista = document.getElementById("llistaProjectes");
  llista.innerHTML = "";
  if (d.projectes && d.projectes.length > 0) {
    for (const p of d.projectes) {
      const li = document.createElement("li");
      li.textContent = p.Nom_projecte || `Projecte #${p.idProyecto}`;
      llista.appendChild(li);
    }
  } else {
    llista.innerHTML = "<li>Cap projecte assignat</li>";
  }
}

loadDomicili();
