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

function renderSidebar(activePage) {
    const role = getRole();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    let html = `<div class="logo">FunEduca</div>`;

    const mainItems = [
        { label: 'Persones', href: '/clients.html', id: 'clients', roles: [1, 2, 3, 4] },
        { label: 'Families', href: '/families.html', id: 'families', roles: [1, 2, 3, 4] },
        { label: 'Projectes', href: '/projectes.html', id: 'projectes', roles: [1, 2, 3, 4] },
        { label: 'Centres activitats', href: '/centres.html', id: 'centres', roles: [1, 2] },
        { label: 'Usuaris App', href: '/usuaris.html', id: 'usuaris', roles: [1] },
        { label: 'Els meus projectes', href: '/meus-projectes.html', id: 'meus-projectes', roles: [2] },
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
