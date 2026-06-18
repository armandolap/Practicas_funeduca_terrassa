let currentFilter = 'todos';
let searchTimeout;

function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadProjects, 300);
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.className = 'btn btn-sm btn-secondary');
    document.querySelector(`[data-filter="${filter}"]`).className = 'btn btn-sm btn-primary';
    loadProjects();
}

async function loadProjects() {
    if (!requireAuth()) return;
    const q = document.getElementById('searchQ').value.trim();
    const params = new URLSearchParams({ filter: currentFilter });
    if (q) params.set('q', q);
    try {
        const res = await fetch(`/projectes?${params}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const projects = await res.json();
        const tbody = document.getElementById('projectList');
        if (!projects.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No hi ha projectes</td></tr>';
            return;
        }
        tbody.innerHTML = projects.map(p => `
            <tr class="clickable" onclick="window.location.href='/projecte.html?id=${p.idProyecto}'">
                <td><strong>${p.Nom_projecte || ''}</strong></td>
                <td>${p.fecha_inicio_act ? new Date(p.fecha_inicio_act).toLocaleDateString() : '-'}</td>
                <td>${p.fecha_fin_act ? new Date(p.fecha_fin_act).toLocaleDateString() : '-'}</td>
                <td>${p.plazas || 0}</td>
                <td>${p.inscritos || 0}</td>
                <td>${p.responsable_nom ? `${p.responsable_nom} ${p.responsable_cognoms || ''}` : '-'}</td>
                <td>${p.nom_centre_activitats || '-'}</td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

function checkRole() {
    const role = getRole();
    if (role === 1 || role === 2) {
        const btn = document.getElementById('btnCrear');
        if (btn) btn.style.display = 'inline-flex';
    }
}
