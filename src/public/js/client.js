var $ = function(id) { return document.getElementById(id); };
var params = new URLSearchParams(window.location.search);
var clientId = params.get("id");
if (!clientId) { window.location.href = "/clients.html"; }

var clientData = null;
var currentFilter = "actius";

function getUserLevel() {
  try {
    var token = localStorage.getItem("token");
    if (!token) return 99;
    return JSON.parse(atob(token.split(".")[1])).idNivel_acceso;
  } catch(e) { return 99; }
}

function loadClient() {
  fetch("/client/" + clientId).then(function(r) {
    if (!r.ok) { window.location.href = "/clients.html"; throw new Error("Not found"); }
    return r.json();
  }).then(function(data) {
    clientData = data;
    renderClient();
    renderProjects();
    checkRoles();
  });
}

function checkRoles() {
  var level = getUserLevel();
  if (level <= 4 && level !== 3) {
    $("btnEdit").style.display = "inline-flex";
  }
}

function renderClient() {
  var c = clientData;
  $("clientName").textContent = c.Nom + " " + c.Cognoms;
  $("clientAge").textContent = c.C_edad ? c.C_edad + " anys" : "-";
  $("clientGender").textContent = c.Nom_genere || "-";
  $("clientTemps").textContent = c.temps_entitat || "0";
  $("clientActivitats").textContent = (c.projectes || []).length;

  var famLink = $("clientFamilia");
  famLink.textContent = c.Cognom_familiar || "-";
  famLink.href = "/familia.html?id=" + (c.idFamilia || "");

  var parts = [c.tipus_via_nom, c.Nom_calle, c.Num_calle];
  if (c.Pis) parts.push("Pis " + c.Pis);
  if (c.Escala) parts.push("Esc " + c.Escala);
  parts.push(c.barri_nom, c.codi_postal_nom);
  $("clientAddress").textContent = parts.filter(Boolean).join(", ") || "Sense domicili";

  $("clientPhone").textContent = c.Telefon || "\u2014";
  $("clientEmail").textContent = c.Correu_electronic || "\u2014";
}

function renderProjects() {
  var projects = (clientData.projectes || []).slice();
  var now = new Date();
  var filtered = projects.filter(function(p) {
    var start = p.fecha_inicio_act ? new Date(p.fecha_inicio_act) : null;
    var end = p.fecha_fin_act ? new Date(p.fecha_fin_act) : null;
    if (currentFilter === "actius") {
      return start && start <= now && (!end || end >= now);
    } else if (currentFilter === "futurs") {
      return start && start > now;
    } else if (currentFilter === "passats") {
      return end && end < now;
    }
    return true;
  });

  var tbody = $("projectsBody");
  tbody.innerHTML = "";
  if (filtered.length === 0) {
    var tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px">No hi ha projectes</td>';
    tbody.appendChild(tr);
    return;
  }

  var level = getUserLevel();
  var canRemove = level <= 4 && level !== 3;

  filtered.forEach(function(p) {
    var tr = document.createElement("tr");
    var start = p.fecha_inicio_act ? new Date(p.fecha_inicio_act) : null;
    var end = p.fecha_fin_act ? new Date(p.fecha_fin_act) : null;
    var now = new Date();

    var activeClass = "badge-inactive", activeText = "Inactiu";
    if (start && start <= now && (!end || end >= now)) {
      activeClass = "badge-active"; activeText = "Actiu";
    }

    var openClass = "badge-active", openText = "Obert";
    if (p.inscritos != null && p.plazas != null && p.inscritos >= p.plazas) {
      openClass = "badge-warning"; openText = "Tancat";
    }

    var actions = "";
    if (canRemove) {
      actions = '<button class="btn btn-danger btn-sm btn-remove-project" data-project="' + p.idProyecto + '">Treure del projecte</button>';
    }

    tr.innerHTML = "<td>" + esc(p.Nom_projecte) + "</td><td><span class=\"badge " + activeClass + "\">" + activeText + "</span> <span class=\"badge " + openClass + "\">" + openText + "</span></td><td>" + (p.fecha_fin_act || "\u2014") + "</td><td class=\"project-actions\">" + actions + "</td>";
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btn-remove-project").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      removeFromProject(parseInt(this.dataset.project));
    });
  });
}

function esc(s) {
  if (!s) return "";
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

document.querySelectorAll(".project-tab").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".project-tab").forEach(function(b) { b.classList.remove("active"); });
    this.classList.add("active");
    currentFilter = this.dataset.filter;
    renderProjects();
  });
});

$("btnEdit").addEventListener("click", function() {
  window.location.href = "/index.html?id=" + clientId;
});

function removeFromProject(projectId) {
  if (!confirm("Est\u00E0s segur de treure aquest client del projecte?")) return;
  fetch("/projectes/" + projectId + "/clients/" + clientId, { method: "DELETE" }).then(function(r) {
    if (r.ok) {
      showToast("Client tret del projecte", "success");
      loadClient();
    } else {
      showToast("Error en treure el client", "error");
    }
  });
}

function showToast(msg, type) {
  var t = $("toast");
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(function() { t.classList.remove("show"); }, 3000);
}

var modal = $("assignModal");
$("btnAssign").addEventListener("click", function() {
  modal.style.display = "flex";
  searchProjects("");
});

$("modalClose").addEventListener("click", function() {
  modal.style.display = "none";
});

modal.addEventListener("click", function(e) {
  if (e.target === modal) modal.style.display = "none";
});

var projectSearchTimeout;
$("projectSearch").addEventListener("input", function() {
  clearTimeout(projectSearchTimeout);
  var q = this.value.trim();
  projectSearchTimeout = setTimeout(function() { searchProjects(q); }, 300);
});

function searchProjects(q) {
  var url = "/projectes";
  if (q) url += "?q=" + encodeURIComponent(q);
  fetch(url).then(function(r) { return r.json(); }).then(function(projects) {
    var tbody = $("projectSearchBody");
    tbody.innerHTML = "";
    projects.forEach(function(p) {
      var tr = document.createElement("tr");
      var alreadyAssigned = (clientData.projectes || []).some(function(cp) { return cp.idProyecto === p.idProyecto; });
      tr.innerHTML = "<td>" + esc(p.Nom_projecte) + "</td><td>" + (p.inscritos || 0) + "/" + (p.plazas || 0) + "</td><td>";
      if (alreadyAssigned) {
        tr.innerHTML += '<span class="badge badge-active">Assignat</span>';
      } else {
        tr.innerHTML += '<button class="btn btn-sm btn-success btn-assign" data-project="' + p.idProyecto + '">Assignar</button>';
      }
      tr.innerHTML += "</td>";
      tbody.appendChild(tr);
    });
    if (projects.length === 0) {
      var tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="3" style="text-align:center;color:var(--text-muted);padding:16px">No s\'han trobat projectes</td>';
      tbody.appendChild(tr);
    }
    tbody.querySelectorAll(".btn-assign").forEach(function(btn) {
      btn.addEventListener("click", function() {
        assignToProject(parseInt(this.dataset.project));
      });
    });
  });
}

function assignToProject(projectId) {
  fetch("/projectes/" + projectId + "/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientIds: [parseInt(clientId)] })
  }).then(function(r) {
    if (r.ok) {
      showToast("Client assignat al projecte", "success");
      modal.style.display = "none";
      loadClient();
    } else {
      showToast("Error en assignar el client", "error");
    }
  });
}

loadClient();
