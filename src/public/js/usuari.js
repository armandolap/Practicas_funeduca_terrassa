const $ = id => document.getElementById(id);
const userName = $("userName");
const userRol = $("userRol");
const userEmail = $("userEmail");
const userTelefon = $("userTelefon");
const userRolText = $("userRolText");
const statTotal = $("statTotal");
const statOberts = $("statOberts");
const statActius = $("statActius");
const statInactius = $("statInactius");
const statTancats = $("statTancats");
const projectesBody = $("projectesBody");
const btnEditar = $("btnEditar");
const toast = $("toast");

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

try {
  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.idNivel_acceso;
    if (role === 1 || role === 2) btnEditar.style.display = "inline-block";
  }
} catch {}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
if (!id) {
  showToast("ID d'usuari no trobat", "error");
} else {
  fetch(`/usuario/${id}`).then(r => {
    if (!r.ok) throw new Error("No trobat");
    return r.json();
  }).then(u => {
    document.title = `${u.Nom} ${u.Cognoms}`;
    userName.textContent = `${u.Nom} ${u.Cognoms}`;
    userRol.textContent = u.rol || "";
    userEmail.textContent = u.email || "";
    userTelefon.textContent = u.Telefon || "";
    userRolText.textContent = u.rol || "";

    const projectes = u.projectes || [];
    const total = projectes.length;
    const avui = new Date();
    const oberts = projectes.filter(p => !p.fecha_fin_act || new Date(p.fecha_fin_act) >= avui);
    const actius = projectes.filter(p => (!p.fecha_inicio_act || new Date(p.fecha_inicio_act) <= avui) && (!p.fecha_fin_act || new Date(p.fecha_fin_act) >= avui));
    const inactius = projectes.filter(p => p.fecha_inicio_act && new Date(p.fecha_inicio_act) > avui && (!p.fecha_fin_act || new Date(p.fecha_fin_act) >= avui));
    const tancats = projectes.filter(p => p.fecha_fin_act && new Date(p.fecha_fin_act) < avui);

    statTotal.textContent = total;
    statOberts.textContent = oberts.length;
    statActius.textContent = actius.length;
    statInactius.textContent = inactius.length;
    statTancats.textContent = tancats.length;

    projectesBody.innerHTML = "";
    if (projectes.length === 0) {
      projectesBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">No hi ha projectes assignats</td></tr>';
    } else {
      projectes.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.Nom_projecte || ""}</td>
          <td>${p.nom_centre_activitats || ""}</td>
          <td>${p.inscritos || 0}</td>
          <td>${p.estat || ""}</td>
        `;
        projectesBody.appendChild(tr);
      });
    }
  }).catch(() => {
    showToast("Error carregant l'usuari", "error");
    userName.textContent = "Usuari no trobat";
  });
}
