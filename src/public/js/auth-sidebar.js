(function() {
  var token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login.html"; return; }
  var origFetch = window.fetch;
  window.fetch = async function(url, opts) {
    opts = opts || {};
    var headers = opts.headers || {};
    if (token) headers["Authorization"] = "Bearer " + token;
    opts.headers = headers;
    return origFetch(url, opts);
  };
  var sidebar = document.getElementById("sidebar");
  if (sidebar && sidebar.children.length === 0) {
    var role = 1;
    try { role = JSON.parse(atob(token.split('.')[1])).idNivel_acceso; } catch(e) {}
    sidebar.innerHTML =
      '<div class="sidebar-header" style="padding:0.75rem 1.5rem;font-size:1.1rem;font-weight:700;color:#e94560;">FunEduca CRM</div>' +
      '<div class="sidebar-item" data-page="projectes">Projectes</div>' +
      '<div class="sidebar-item" data-page="clients">Clients</div>' +
      '<div class="sidebar-item" data-page="families">Fam\u00edlies</div>' +
      '<div class="sidebar-item" data-page="usuaris">Responsables/Treballadors</div>' +
      '<div class="sidebar-item" data-page="domicilis">Domicilis</div>' +
      '<div class="sidebar-item" data-page="informes">Informes</div>' +
      '<div class="sidebar-item" data-page="config" id="sidebarConfig"' + (role === 1 ? '' : ' style="display:none"') + '>Configuraci\u00f3</div>' +
      '<div class="sidebar-item" data-page="persones">Persones/Fam\u00edlies</div>' +
      '<div class="sidebar-item" data-page="persona">Crear persona</div>' +
      '<hr>' +
      '<div class="sidebar-item" id="sidebarLogout">Tancar sessi\u00f3</div>';
  }
  var page = document.body && document.body.dataset.page;
  if (page) {
    document.querySelectorAll(".sidebar-item").forEach(function(el) {
      if (el.dataset.page === page) el.classList.add("active");
    });
  }
  if (sidebar) {
    sidebar.addEventListener("click", function(e) {
      var item = e.target.closest(".sidebar-item");
      if (!item) return;
      if (item.id === "sidebarLogout") {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
        return;
      }
      var targetPage = item.dataset.page;
      if (!targetPage) return;
      var routes = {
        projectes: "/projectes.html",
        clients: "/clients.html",
        families: "/families.html",
        usuaris: "/usuaris.html",
        domicilis: "/domicilis.html",
        informes: "/informes.html",
        config: "/config.html",
        persones: "/persones-families.html",
        persona: "/index.html"
      };
      if (routes[targetPage]) window.location.href = routes[targetPage];
    });
  }
})();
