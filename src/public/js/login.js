const email = document.getElementById("email");
const password = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const error = document.getElementById("loginError");

if (localStorage.getItem("token")) {
  window.location.href = "/projectes.html";
}

btnLogin.addEventListener("click", async () => {
  if (!email.value.trim() || !password.value.trim()) {
    error.textContent = "Omple tots els camps";
    error.style.display = "block";
    return;
  }
  btnLogin.disabled = true;
  btnLogin.textContent = "Iniciant sessió...";
  error.style.display = "none";
  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/projectes.html";
    } else {
      error.textContent = "Credencials incorrectes";
      error.style.display = "block";
    }
  } catch {
    error.textContent = "Error de connexió";
    error.style.display = "block";
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "Iniciar sessió";
  }
});

password.addEventListener("keydown", (e) => { if (e.key === "Enter") btnLogin.click(); });
email.addEventListener("keydown", (e) => { if (e.key === "Enter") password.focus(); });
