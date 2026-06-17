const $ = id => document.getElementById(id);
const usuarisBody = $("usuarisBody");
const searchUsuari = $("searchUsuari");
const btnSearchUsuari = $("btnSearchUsuari");
const filterBtns = document.querySelectorAll(".filter-btn");
const btnCrearUsuari = $("btnCrearUsuari");
const toast = $("toast");

let currentFilter = "";

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
    if (role === 1 || role === 2) btnCrearUsuari.style.display = "inline-block";
  }
} catch {}

btnCrearUsuari.addEventListener("click", () => {
  window.location.href = "/usuari-crear.html";
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    loadData();
  });
});

function renderRow(u) {
  const tr = document.createElement("tr");
  tr.className = "clickable";
  tr.dataset.id = u.idUsuario_APP;
  tr.innerHTML = `
    <td>${u.Nom || ""}</td>
    <td>${u.Cognoms || ""}</td>
    <td>${u.rol || ""}</td>
    <td>${u.Telefon || ""}</td>
    <td>${u.email || ""}</td>
    <td>${u.num_projectes_actius || 0}</td>
    <td>${u.num_projectes_oberts || 0}</td>
    <td>${u.num_persones_en_projectes_actius || 0}</td>
  `;
  tr.addEventListener("click", () => {
    window.location.href = `/usuari.html?id=${u.idUsuario_APP}`;
  });
  usuarisBody.appendChild(tr);
}

async function loadData() {
  const q = searchUsuari.value.trim();
  const params = new URLSearchParams();
  if (currentFilter) params.set("filter", currentFilter);
  if (q) params.set("q", q);
  try {
    const res = await fetch(`/usuario?${params.toString()}`);
    if (!res.ok) { showToast("Error carregant usuaris", "error"); return; }
    const data = await res.json();
    usuarisBody.innerHTML = "";
    if (data.length === 0) {
      usuarisBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#888;">No s\'han trobat usuaris</td></tr>';
    } else {
      data.sort((a, b) => (b.num_projectes_actius || 0) - (a.num_projectes_actius || 0));
      data.forEach(renderRow);
    }
  } catch { showToast("Error de connexió", "error"); }
}

btnSearchUsuari.addEventListener("click", loadData);
searchUsuari.addEventListener("keydown", e => {
  if (e.key === "Enter") loadData();
});

loadData();
