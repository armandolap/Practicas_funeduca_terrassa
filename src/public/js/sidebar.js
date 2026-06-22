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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
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
}
