async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('errorMsg');
    if (!username || !password) {
        errorEl.textContent = 'Usuari i contrasenya obligatoris';
        errorEl.style.display = 'block';
        return;
    }
    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.message || 'Error al iniciar sessió';
            errorEl.style.display = 'block';
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.idNivel_acceso === 2 || data.user.idNivel_acceso === 3) {
            window.location.href = '/meus-projectes.html';
        } else {
            window.location.href = '/clients.html';
        }
    } catch (err) {
        errorEl.textContent = 'Error de connexió';
        errorEl.style.display = 'block';
    }
}

if (localStorage.getItem('token')) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.idNivel_acceso === 2 || user.idNivel_acceso === 3) {
        window.location.href = '/meus-projectes.html';
    } else {
        window.location.href = '/clients.html';
    }
}
