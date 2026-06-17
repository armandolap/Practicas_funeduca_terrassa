async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('errorMsg');
    if (!email || !password) {
        errorEl.textContent = 'Email i contrasenya obligatoris';
        errorEl.style.display = 'block';
        return;
    }
    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.message || 'Error al iniciar sessió';
            errorEl.style.display = 'block';
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.idNivel_acceso === 2) {
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
    if (user.idNivel_acceso === 2) {
        window.location.href = '/meus-projectes.html';
    } else {
        window.location.href = '/clients.html';
    }
}
