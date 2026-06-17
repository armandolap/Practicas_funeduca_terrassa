const $ = id => document.getElementById(id);
const inputNom = $("inputNom");
const inputCognoms = $("inputCognoms");
const inputEmail = $("inputEmail");
const inputTelefon = $("inputTelefon");
const inputNivell = $("inputNivell");
const inputPassword = $("inputPassword");
const btnSubmit = $("btnSubmit");
const toast = $("toast");

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 4000);
}

const NIVELLS = [
  { id: 1, Nom: "Total" },
  { id: 2, Nom: "Responsable de zona" },
  { id: 4, Nom: "Viewer" },
  { id: 5, Nom: "Treballador" }
];

NIVELLS.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n.id;
  opt.textContent = n.Nom;
  inputNivell.appendChild(opt);
});

btnSubmit.addEventListener("click", async () => {
  if (!inputNom.value.trim()) { showToast("El camp Nom és obligatori", "error"); inputNom.focus(); return; }
  if (!inputCognoms.value.trim()) { showToast("El camp Cognoms és obligatori", "error"); inputCognoms.focus(); return; }
  if (!inputEmail.value.trim()) { showToast("El camp Email és obligatori", "error"); inputEmail.focus(); return; }
  if (!inputTelefon.value.trim()) { showToast("El camp Telèfon és obligatori", "error"); inputTelefon.focus(); return; }
  if (!inputNivell.value) { showToast("Selecciona un nivell d'accés", "error"); inputNivell.focus(); return; }
  if (!inputPassword.value) { showToast("La contrasenya és obligatòria", "error"); inputPassword.focus(); return; }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Creant...";

  try {
    const res = await fetch("/usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nom: inputNom.value.trim(),
        Cognoms: inputCognoms.value.trim(),
        email: inputEmail.value.trim(),
        Telefon: inputTelefon.value.trim(),
        idNivel_acceso: parseInt(inputNivell.value),
        password: inputPassword.value
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Usuari creat correctament (ID: ${data.id})`, "success");
      setTimeout(() => { window.location.href = "/usuaris.html"; }, 1500);
    } else {
      showToast(data.error || "Error creant usuari", "error");
    }
  } catch {
    showToast("Error de connexió", "error");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "CREAR USUARI";
  }
});
