(function() {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login.html"; return; }
  const origFetch = window.fetch;
  window.fetch = async function(url, opts) {
    opts = opts || {};
    const headers = opts.headers || {};
    if (token) headers["Authorization"] = "Bearer " + token;
    opts.headers = headers;
    return origFetch(url, opts);
  };
  const page = document.body && document.body.dataset.page;
  if (page) {
    document.querySelectorAll(".sidebar-item").forEach(function(el) {
      if (el.dataset.page === page) el.classList.add("active");
    });
  }
})();
