const $ = id => document.getElementById(id);
const familyName = $("familyName");
const familyEstructura = $("familyEstructura");
const domicilisList = $("domicilisList");
const membresBody = $("membresBody");
const projectesList = $("projectesList");
const toast = $("toast");

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
if (!id) {
  showToast("ID de família no trobat", "error");
} else {
  fetch(`/familia/${id}`).then(r => {
    if (!r.ok) throw new Error("No trobat");
    return r.json();
  }).then(f => {
    document.title = `Família ${f.Cognom_familiar}`;
    familyName.textContent = f.Cognom_familiar;
    familyEstructura.textContent = f.Nom_est_fam || "";

    domicilisList.innerHTML = "";
    if (f.domicilis && f.domicilis.length > 0) {
      f.domicilis.forEach(d => {
        const li = document.createElement("li");
        const parts = [];
        if (d.tipus_via) parts.push(d.tipus_via);
        if (d.Nom_calle) parts.push(d.Nom_calle);
        if (d.Num_calle) parts.push(d.Num_calle);
        if (d.Pis) parts.push(`Pis ${d.Pis}`);
        if (d.Escala) parts.push(`Esc ${d.Escala}`);
        if (d.barri) parts.push(`- ${d.barri}`);
        if (d.codi_postal) parts.push(`(${d.codi_postal})`);
        li.textContent = parts.join(" ") || d.adreca_completa || "";
        domicilisList.appendChild(li);
      });
    } else {
      domicilisList.innerHTML = "<li style='color:#888;'>No hi ha domicilis associats</li>";
    }

    membresBody.innerHTML = "";
    if (f.membres && f.membres.length > 0) {
      f.membres.forEach(c => {
        const tr = document.createElement("tr");
        tr.className = "clickable";
        const edat = c.C_edad || "";
        tr.innerHTML = `<td>${c.Nom}</td><td>${c.Cognoms}</td><td>${c.Nom_rol || ""}</td><td>${edat}</td>`;
        tr.addEventListener("click", () => {
          window.location.href = `/clients.html?id=${c.idClient}`;
        });
        membresBody.appendChild(tr);
      });
    } else {
      membresBody.innerHTML = "<tr><td colspan='4' style='text-align:center;color:#888;'>No hi ha membres</td></tr>";
    }

    projectesList.innerHTML = "";
    if (f.projectes && f.projectes.length > 0) {
      f.projectes.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.Nom_projecte;
        projectesList.appendChild(li);
      });
    } else {
      projectesList.innerHTML = "<li style='color:#888;'>No hi ha projectes assignats</li>";
    }
  }).catch(() => {
    showToast("Error carregant la família", "error");
    familyName.textContent = "Família no trobada";
  });
}
