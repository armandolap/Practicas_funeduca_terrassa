function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (token) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    }
    return fetch(url, options);
}

function getRole() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.idNivel_acceso : null;
    } catch { return null; }
}

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login.html'; return false; }
    return true;
}

function logout() {
    showLoading();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// ===== Overlay de càrrega (spinner global) =====
// Mostra un overlay amb spinner. Es pot cridar diverses vegades (es porta un comptador).
let _loadingCount = 0;
function showLoading() {
    _loadingCount++;
    let ov = document.getElementById('globalLoading');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'globalLoading';
        ov.className = 'loading-overlay';
        ov.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(ov);
    }
    ov.classList.add('show');
}
function hideLoading() {
    _loadingCount = Math.max(0, _loadingCount - 1);
    if (_loadingCount === 0) {
        const ov = document.getElementById('globalLoading');
        if (ov) ov.classList.remove('show');
    }
}

// ===== Modal de confirmació =====
// Substitueix confirm() natiu. Retorna una Promise<boolean>.
// opts: { okText, cancelText, danger }
function confirmModal(message, opts = {}) {
    const okText = opts.okText || 'Confirmar';
    const cancelText = opts.cancelText || 'Cancel·lar';
    const okClass = opts.danger === false ? 'btn-primary' : 'btn-danger';
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML =
            `<div class="modal confirm-box">`
            + `<p></p>`
            + `<div class="modal-actions">`
            + `<button class="btn btn-secondary" data-act="cancel">${cancelText}</button>`
            + `<button class="btn ${okClass}" data-act="ok">${okText}</button>`
            + `</div></div>`;
        overlay.querySelector('p').textContent = message;
        const close = (val) => { overlay.remove(); resolve(val); };
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
            const act = e.target.getAttribute('data-act');
            if (act === 'ok') close(true);
            if (act === 'cancel') close(false);
        });
        document.body.appendChild(overlay);
        overlay.querySelector('[data-act="ok"]').focus();
    });
}

// Mostra un avís a dalt a la dreta. Crea el seu propi toast (independent del toast d'errors).
// Es tanca sol després de `duration` ms.
function notifyTop(msg, type = 'success', duration = 3000) {
    let t = document.getElementById('topToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'topToast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = `toast top ${type} show`;
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => { t.className = 'toast top'; }, duration);
    return t;
}

// Deixa un avís pendent perquè es mostri a la pàgina de destí i redirigeix IMMEDIATAMENT.
function notifyAndRedirect(msg, url, type = 'success') {
    try { sessionStorage.setItem('pendingToast', JSON.stringify({ msg, type })); } catch {}
    window.location.href = url;
}

// Mostra l'avís pendent (desat per notifyAndRedirect) si n'hi ha. Es crida en carregar la pàgina.
function showPendingToast() {
    let raw;
    try { raw = sessionStorage.getItem('pendingToast'); } catch { return; }
    if (!raw) return;
    sessionStorage.removeItem('pendingToast');
    try {
        const { msg, type } = JSON.parse(raw);
        notifyTop(msg, type);
    } catch {}
}

// Mostra una notificació toast. Requereix un <div id="toast"> a la pàgina.
function showToast(msg, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.className = 'toast', 3000);
}

// Crea una funció amb debounce: retarda l'execució de `fn` fins que passen `ms` mil·lisegons sense noves crides.
function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// Pinta els controls de paginació dins de #containerId.
// onGo: nom de la funció global a cridar (rep el número de pàgina). totalCount opcional → mostra "(N total)".
function renderPagination(containerId, currentPage, totalPages, onGo, totalCount) {
    const info = totalCount === undefined
        ? `Pàg ${currentPage + 1} de ${totalPages || 1}`
        : `Pàg ${currentPage + 1} de ${totalPages || 1} (${totalCount} total)`;
    document.getElementById(containerId).innerHTML =
        `<button onclick="${onGo}(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>Anterior</button>`
        + `<span>${info}</span>`
        + `<button onclick="${onGo}(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Següent</button>`;
}

function renderSidebar(activePage) {
    const role = getRole();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    let html = `<div class="logo">FunEduca</div>`;

    const mainItems = [
        { label: 'Persones', href: '/clients.html', id: 'clients', roles: [1, 2, 3, 4, 5] },
        { label: 'Families', href: '/families.html', id: 'families', roles: [1, 2, 3, 4, 5] },
        { label: 'Projectes', href: '/projectes.html', id: 'projectes', roles: [1, 2, 3, 4, 5] },
        { label: 'Centres activitats', href: '/centres.html', id: 'centres', roles: [1, 2] },
        { label: 'Usuaris App', href: '/usuaris.html', id: 'usuaris', roles: [1] },
        { label: 'Els meus projectes', href: '/meus-projectes.html', id: 'meus-projectes', roles: [2, 3] },
    ];
    mainItems.forEach(item => {
        if (item.roles.includes(role)) {
            html += `<a href="${item.href}" class="sidebar-item${activePage === item.id ? ' active' : ''}">${item.label}</a>`;
        }
    });

    html += `<hr>`;
    if (role === 1) {
        html += `<a href="/informes.html" class="sidebar-item${activePage === 'informes' ? ' active' : ''}">Informes</a>`;
        html += `<a href="/config.html" class="sidebar-item${activePage === 'config' ? ' active' : ''}">Configuració</a>`;
        html += `<hr>`;
    }
    if (user.Nom) {
        html += `<div class="user-info">${user.Nom} ${user.Cognoms || ''}<br><small style="cursor:pointer;color:#ef4444;" onclick="logout()">Tancar sessió</small></div>`;
    }
    sidebar.innerHTML = html;
    showPendingToast();
}
