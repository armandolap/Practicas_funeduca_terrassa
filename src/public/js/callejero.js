const tipusViaSelect = document.getElementById("tipusVia");
const nomCalleInput = document.getElementById("nomCalle");
const barriInput = document.getElementById("barri");
const cpInput = document.getElementById("codiPostal");
const dropdown = document.getElementById("dropdown");
const previewBar = document.getElementById("previewBar");

let debounceTimer = null;
let lastQuery = "";
let lastResults = [];
let selectedId = null;

tipusViaSelect.addEventListener("change", onFilterChange);
nomCalleInput.addEventListener("input", onFilterChange);

function onFilterChange() {
    const q = nomCalleInput.value.trim();
    if (q.length < 3) {
        dropdown.style.display = "none";
        barriInput.value = "";
        cpInput.value = "";
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (q === lastQuery) return;
        lastQuery = q;
        selectedId = null;
        updatePreview();
        fetchResults();
    }, 500);
}

async function fetchResults() {
    const tipus_via = tipusViaSelect.value;
    const q = nomCalleInput.value.trim();
    if (q.length < 3) return;

    let url = `/callejero?q=${encodeURIComponent(q)}`;
    if (tipus_via) url += `&tipus_via=${encodeURIComponent(tipus_via)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) return;
        lastResults = await res.json();
        showDropdown(lastResults);
        autoFill(lastResults);
    } catch { }
}

function showDropdown(results) {
    dropdown.innerHTML = "";
    if (results.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    const counts = {};
    for (const r of results) {
        counts[r.Nom_complet] = (counts[r.Nom_complet] || 0) + 1;
    }

    for (const r of results) {
        const div = document.createElement("div");
        const needDisambiguate = counts[r.Nom_complet] > 1;
        if (needDisambiguate) {
            div.textContent = r.Nom_complet;
            const small = document.createElement("small");
            const parts = [];
            if (r.barri) parts.push(r.barri);
            if (r.codi_postal) parts.push(r.codi_postal);
            small.textContent = parts.join(" · ");
            div.appendChild(small);
        } else {
            div.textContent = r.Nom_complet;
        }
        div.addEventListener("click", () => selectResult(r));
        dropdown.appendChild(div);
    }
    dropdown.style.display = "block";
}

function selectResult(r) {
    nomCalleInput.value = r.Nom_complet;
    barriInput.value = r.barri || "";
    cpInput.value = r.codi_postal || "";
    dropdown.style.display = "none";
    lastQuery = r.Nom_complet;
    selectedId = r.idDireccio;
    updatePreview(r);
}

function updatePreview(r) {
    if (!r) {
        previewBar.textContent = "";
        return;
    }
    const via = r.tipus_via || "";
    const nom = r.Nom_complet || "";
    const barri = r.barri || "";
    const cp = r.codi_postal || "";

    let text = `(${via}) ${nom}`;
    if (barri) text += ` [${barri}]`;
    if (cp) text += ` <${cp}>`;
    previewBar.textContent = text;
}

function autoFill(results) {
    if (results.length === 0) {
        barriInput.value = "";
        cpInput.value = "";
        return;
    }
    const barris = new Set(results.map(r => r.barri).filter(Boolean));
    const cps = new Set(results.map(r => r.codi_postal).filter(Boolean));
    barriInput.value = barris.size === 1 ? [...barris][0] : "";
    cpInput.value = cps.size === 1 ? [...cps][0] : "";
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-wrap")) {
        dropdown.style.display = "none";
    }
});

async function loadTipusVia() {
    try {
        const res = await fetch("/tipusVia");
        if (!res.ok) return;
        const items = await res.json();
        for (const item of items) {
            const opt = document.createElement("option");
            opt.value = item.idTipus_via;
            opt.textContent = item.Nom;
            tipusViaSelect.appendChild(opt);
        }
    } catch { }
}

loadTipusVia();
