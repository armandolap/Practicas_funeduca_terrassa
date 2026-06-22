// ============================================================
//  Validador únic i reutilitzable per a tots els formularis
//  Ús:
//    const v = validateForm([
//      { id: "nom",    rules: ["required"],          label: "Nom" },
//      { id: "correu", rules: ["email"],             label: "Correu" },
//      { id: "telefon",rules: ["phone"],             label: "Telèfon" },
//      { id: "pass",   rules: [["minlength", 6]],    label: "Contrasenya" },
//    ]);
//    if (!v.ok) return; // els errors ja s'han pintat sota cada camp
//
//  Validació NOMÉS en enviar. Marca el camp amb vora vermella + missatge a sota.
// ============================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Telèfon: 9 dígits, opcionalment amb prefix +34 / 0034 i espais o guions
const PHONE_RE = /^(\+?\d{1,3}[\s-]?)?(\d[\s-]?){9}$/;

// ---- Regles disponibles. Cada regla retorna null si OK, o un missatge d'error ----
const RULES = {
  required: (val) =>
    val.trim() === "" ? "Aquest camp és obligatori" : null,

  email: (val) =>
    val.trim() === "" || EMAIL_RE.test(val.trim())
      ? null
      : "Format de correu invàlid (ex: nom@domini.com)",

  phone: (val) =>
    val.trim() === "" || PHONE_RE.test(val.trim())
      ? null
      : "Telèfon invàlid (9 dígits)",

  number: (val) =>
    val.trim() === "" || !isNaN(Number(val.trim()))
      ? null
      : "Ha de ser un número",

  minlength: (val, n) =>
    val.trim() === "" || val.trim().length >= n
      ? null
      : `Mínim ${n} caràcters`,

  maxlength: (val, n) =>
    val.length <= n ? null : `Màxim ${n} caràcters`,

  // Data no pot ser futura (útil per data de naixement)
  notFuture: (val) => {
    if (!val) return null;
    return new Date(val) > new Date()
      ? "La data no pot ser futura"
      : null;
  },
};

// ---- Pinta / neteja l'error d'un camp ----
function setFieldError(el, msg) {
  el.classList.add("field-invalid");
  let err = el.parentElement.querySelector(".field-error");
  if (!err) {
    err = document.createElement("div");
    err.className = "field-error";
    el.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

function clearFieldError(el) {
  el.classList.remove("field-invalid");
  const err = el.parentElement.querySelector(".field-error");
  if (err) err.remove();
}

/**
 * Valida un conjunt de camps.
 * @param {Array} fields  - [{ id, rules, label?, compare? }]
 *   rules: string ("required") o array (["minlength", 6]) o funció custom (val) => msg|null
 * @returns {{ ok: boolean, firstInvalid: HTMLElement|null }}
 */
function validateForm(fields) {
  let firstInvalid = null;

  for (const f of fields) {
    const el = document.getElementById(f.id);
    if (!el) continue;
    clearFieldError(el);

    const val = el.value ?? "";
    let error = null;

    for (const rule of f.rules) {
      if (typeof rule === "function") {
        error = rule(val, el);
      } else if (Array.isArray(rule)) {
        const [name, ...args] = rule;
        error = RULES[name] ? RULES[name](val, ...args) : null;
      } else {
        error = RULES[rule] ? RULES[rule](val) : null;
      }
      if (error) break; // primera regla que falla
    }

    if (error) {
      setFieldError(el, error);
      if (!firstInvalid) firstInvalid = el;
    }
  }

  if (firstInvalid) firstInvalid.focus();
  return { ok: !firstInvalid, firstInvalid };
}

// Neteja tots els errors d'un formulari (útil en reset)
function clearFormErrors(container = document) {
  container.querySelectorAll(".field-invalid").forEach((el) =>
    el.classList.remove("field-invalid")
  );
  container.querySelectorAll(".field-error").forEach((el) => el.remove());
}
