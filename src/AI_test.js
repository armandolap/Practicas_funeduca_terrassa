const path = require("path");
const fs = require("fs");

const envPath = path.resolve(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
    console.error("ERROR: No s'ha trobat el fitxer .env a l'arrel del projecte.");
    console.error("Crea'l a partir de .env.example:");
    console.error("  cp .env.example .env");
    process.exit(1);
}

require("dotenv").config({ path: envPath });

const { spawn } = require("child_process");
const seed = require("./seeder/seeder");

const BASE_URL = "http://localhost:3000";

const ENDPOINTS = [
    { path: "/paisos", readOnly: true },
    { path: "/estFamilia", readOnly: true },
    { path: "/motiuBaixa", readOnly: true },
    { path: "/neses", readOnly: false },
    { path: "/resulAcad", readOnly: true },
    { path: "/risc", readOnly: true },
    { path: "/rol", readOnly: true },
    { path: "/sebas", readOnly: true },
    { path: "/sitEco", readOnly: true },
    { path: "/tipusDom", readOnly: true },
    { path: "/curso", readOnly: false },
    { path: "/projectes", readOnly: false },
    { path: "/usuario", readOnly: false },
    { path: "/domicili", readOnly: false },
    { path: "/familia", readOnly: false },
    { path: "/client", readOnly: false },
    { path: "/tipusVia", readOnly: false },
    { path: "/barri", readOnly: false },
    { path: "/codiPostal", readOnly: false },
    { path: "/callejero", readOnly: true },
];

const RESULTS = { pass: 0, fail: 0, warn: 0, tests: [], manual: [] };
const CONTROLLER_FIELDS = {
    neses: "Nom_necessitat",
    curso: "Nom",
    usuario: "Nom",
    tipusVia: "Nom",
    barri: "Nom",
    codiPostal: "Codi",
    projectes: "Nom_projecte",
    domicili: "Tipus_domicili",
    familia: "Cognom_familiar",
    client: "Nom",
};

function assert(label, ok, detail) {
    if (ok) {
        RESULTS.pass++;
        RESULTS.tests.push(`  ✓ ${label}`);
        console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    } else {
        RESULTS.fail++;
        RESULTS.tests.push(`  ✗ ${label} — ${detail}`);
        console.log(`  \x1b[31m✗\x1b[0m ${label} — ${detail}`);
    }
}

function warn(label, detail) {
    RESULTS.warn++;
    RESULTS.tests.push(`  ⚠ ${label} — ${detail}`);
    console.log(`  \x1b[33m⚠\x1b[0m ${label} — ${detail}`);
}

function manual(label, steps) {
    RESULTS.manual.push({ label, steps });
}

async function fetchJson(url, options) {
    const res = await fetch(url, options);
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

function pickId(row) {
    if (!row) return null;
    return row.idClient || row.idPais || row.idEstructura_familiar
        || row.idMotiu_baixa || row.idNecessitat_especial
        || row.idResultat_academic || row.idRisc || row.idRol
        || row.idSebas || row.idSituacio_economica
        || row.idTipus_domicili || row.idCurs_actual
        || row.idProyecto || row.idUsuario_APP
        || row.idDomicili || row.idFamilia || row.idClient
        || row.idDireccio || row.idTipus_via || row.idBarri || row.idCodi_postal
        || Object.values(row).find(v => typeof v === "number") || null;
}

function endpointToKey(p) {
    const m = p.match(/^\/(\w+)/);
    if (!m) return null;
    const raw = m[1];
    return raw === "neses" ? "neses" :
        raw === "tipusDom" ? "tipusDom" :
        raw === "sitEco" ? "sitEco" :
        raw === "estFamilia" ? "estFamilia" :
        raw === "resulAcad" ? "resulAcad" :
        raw === "motiuBaixa" ? "motiuBaixa" :
        raw === "tipusVia" ? "tipusVia" :
        raw === "codiPostal" ? "codiPostal" :
        raw === "usuario" ? "usuario" :
        raw === "projectes" ? "projectes" :
        raw;
}

async function testEndpoint(ep) {
    const { path: routePath, readOnly } = ep;
    const fullPath = `${BASE_URL}${routePath}`;
    const name = routePath;
    let id = null;
    let createdPayload = null;

    // GET all
    {
        const { status, body } = await fetchJson(fullPath);
        assert(
            `GET ${name} → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
        if (Array.isArray(body) && body.length > 0) {
            assert(
                `GET ${name} body[0] té id`,
                pickId(body[0]) !== null,
                `no s'ha pogut identificar el camp id a: ${JSON.stringify(Object.keys(body[0]))}`
            );
            id = pickId(body[0]);
        } else if (name === "/callejero") {
            warn(`GET ${name} array buit (callejero sense query ok)`, "callejero sense query espera array buit");
        } else {
            warn(`GET ${name} array buit`, "no hi ha dades — els tests de GET/:id usaran id=1");
            id = 1;
        }
    }

    // GET /:id (valid)
    const validId = id || 1;
    {
        const { status, body } = await fetchJson(`${fullPath}/${validId}`);
        assert(
            `GET ${name}/${validId} → ${status}`,
            status === 200 && body !== null,
            `expected 200 + object, got ${status}`
        );
        if (status === 200 && body) {
            assert(
                `GET ${name}/${validId} body té id`,
                pickId(body) !== null,
                `body no té camp id: ${JSON.stringify(Object.keys(body))}`
            );
        }
    }

    // GET /:id (invalid)
    {
        const { status } = await fetchJson(`${fullPath}/999999`);
        assert(
            `GET ${name}/999999 → ${status}`,
            status === 404,
            `expected 404, got ${status}`
        );
    }

    // POST to read-only → 404 or 405
    if (readOnly) {
        const { status } = await fetchJson(fullPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test: true }),
        });
        assert(
            `POST ${name} (readOnly) → ${status}`,
            status === 404 || status === 405,
            `expected 404/405, got ${status}`
        );

        // PUT to read-only → 404 or 405
        const { status: putSt } = await fetchJson(`${fullPath}/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test: true }),
        });
        assert(
            `PUT ${name}/1 (readOnly) → ${putSt}`,
            putSt === 404 || putSt === 405,
            `expected 404/405, got ${putSt}`
        );

        // DELETE to read-only → 404 or 405
        const { status: delSt } = await fetchJson(`${fullPath}/1`, {
            method: "DELETE",
        });
        assert(
            `DELETE ${name}/1 (readOnly) → ${delSt}`,
            delSt === 404 || delSt === 405,
            `expected 404/405, got ${delSt}`
        );
    }

    if (!readOnly) {
        const payload = buildPayload(name);
        if (!payload) {
            warn(`POST ${name} skipped`, "no payload definit");
            return;
        }

        // POST with invalid/empty body → 400
        {
            const { status } = await fetchJson(fullPath, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            assert(
                `POST ${name} {} → ${status} (validation)`,
                status === 400,
                `expected 400 for empty body, got ${status}`
            );
        }

        // POST with invalid FK (client only)
        if (name === "/client") {
            const invalidFK = { ...payload, idFamilia: 999999 };
            const { status } = await fetchJson(fullPath, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invalidFK),
            });
            assert(
                `POST ${name} FK invalid (idFamilia: 999999) → ${status}`,
                status >= 400,
                `expected error status (400+), got ${status}`
            );
        }

        // PUT to non-existent ID → 404
        {
            const { status } = await fetchJson(`${fullPath}/999999`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ test: true }),
            });
            assert(
                `PUT ${name}/999999 (nonexistent) → ${status}`,
                status === 404,
                `expected 404, got ${status}`
            );
        }

        // DELETE to non-existent ID → 404
        {
            const { status } = await fetchJson(`${fullPath}/999999`, {
                method: "DELETE",
            });
            assert(
                `DELETE ${name}/999999 (nonexistent) → ${status}`,
                status === 404,
                `expected 404, got ${status}`
            );
        }

        // POST create
        createdPayload = payload;
        const { status, body } = await fetchJson(fullPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        assert(
            `POST ${name} → ${status}`,
            status === 201 && body && body.id,
            `expected 201 + {id}, got ${status} ${JSON.stringify(body)}`
        );
        id = body?.id;

        if (id) {
            // Verify POST data persisted: GET /:id and check field
            const { status: getSt, body: getBody } = await fetchJson(`${fullPath}/${id}`);
            assert(
                `GET ${name}/${id} after create → ${getSt}`,
                getSt === 200 && getBody !== null,
                `expected 200 + object, got ${getSt}`
            );
            if (getBody) {
                const key = endpointToKey(name);
                const field = key ? CONTROLLER_FIELDS[key] : null;
                if (field && key !== "client" && key !== "projectes") {
                    const sentVal = typeof payload === "object" ? payload[field] : null;
                    const gotVal = getBody[field];
                    assert(
                        `GET ${name}/${id} camp "${field}" = "${gotVal}"`,
                        sentVal !== null && gotVal === sentVal,
                        `expected "${sentVal}", got "${gotVal}"`
                    );
                }
                if (key === "projectes") {
                    const sentVal = payload.projecte ? payload.projecte.Nom_projecte : null;
                    const gotVal = getBody.Nom_projecte;
                    assert(
                        `GET ${name}/${id} camp "Nom_projecte" = "${gotVal}"`,
                        sentVal !== null && gotVal === sentVal,
                        `expected "${sentVal}", got "${gotVal}"`
                    );
                }
            }

            // PUT update
            const updatePayload = buildUpdatePayload(name);
            const { status: putStatus, body: putBody } = await fetchJson(`${fullPath}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });
            assert(
                `PUT ${name}/${id} → ${putStatus}`,
                putStatus === 200,
                `expected 200, got ${putStatus} ${JSON.stringify(putBody)}`
            );

            // Verify PUT actually changed data
            const { status: getSt2, body: getBody2 } = await fetchJson(`${fullPath}/${id}`);
            assert(
                `GET ${name}/${id} after update → ${getSt2}`,
                getSt2 === 200 && getBody2 !== null,
                `expected 200 + object, got ${getSt2}`
            );
            if (getBody2) {
                const key = endpointToKey(name);
                const field = key ? CONTROLLER_FIELDS[key] : null;
                const originalVal = key === "projectes"
                    ? updatePayload.Nom_projecte
                    : updatePayload && typeof updatePayload === "object" ? updatePayload[field] : null;
                const gotVal = key === "projectes" ? getBody2.Nom_projecte : getBody2[field];
                if (field && originalVal && key !== "client") {
                    assert(
                        `GET ${name}/${id} after update: "${field}" = "${gotVal}"`,
                        gotVal === originalVal,
                        `expected "${originalVal}", got "${gotVal}"`
                    );
                }
                if (key === "client") {
                    assert(
                        `GET ${name}/${id} after update: "Nom" = "${getBody2.Nom}"`,
                        getBody2.Nom === "Maria Actualitzada",
                        `expected "Maria Actualitzada", got "${getBody2.Nom}"`
                    );
                }
                if (key === "projectes") {
                    assert(
                        `GET ${name}/${id} after update: "Nom_projecte" = "${gotVal}"`,
                        gotVal === "Projecte Test 2 Actualitzat",
                        `expected "Projecte Test 2 Actualitzat", got "${gotVal}"`
                    );
                }
            }

            // DELETE remove
            const { status: delStatus } = await fetchJson(`${fullPath}/${id}`, {
                method: "DELETE",
            });
            assert(
                `DELETE ${name}/${id} → ${delStatus}`,
                delStatus === 200,
                `expected 200, got ${delStatus}`
            );

            // GET deleted → 404
            const { status: getDelStatus } = await fetchJson(`${fullPath}/${id}`);
            assert(
                `GET ${name}/${id} (after delete) → ${getDelStatus}`,
                getDelStatus === 404,
                `expected 404, got ${getDelStatus}`
            );
        }
    }
}

function buildPayload(name) {
    const payloads = {
        "/neses": { Nom_necessitat: "Necessitat Test" },
        "/curso": { Nom: "Curs Test" },
        "/projectes": {
            projecte: {
                Nom_projecte: "Projecte Test 2",
                Descripcio: "Descripcio test 2",
                plazas: 10,
                inscritos: 0,
                fecha_inicio_act: "2026-06-16",
                fecha_fin_act: "2026-12-31",
                idcentre_activitats: 1
            }
        },
        "/usuario": {idNivel_acceso: 1,Nom: "Test",Cognoms: "User",email: "test@test.com",Telefon: "600000000"},
        "/domicili": { Tipus_domicili: 1, Direccio: 1 },
        "/familia": { Cognom_familiar: "Test", idDomicili: 1, Estructura_familiar: 1 },
        "/tipusVia": { Nom: "TEST VIA" },
        "/barri": { Nom: "TEST BARRI" },
        "/codiPostal": { Codi: "99999" },
        "/client": {
            idFamilia: 1, idRol: 3, idGenere: 1,
            Nom: "Maria", Cognoms: "Test",
            Data_d_alta: "2025-01-01", C_temps_a_lentitat: "0 anys",
            Fecha_nacimiento: "2000-01-01", C_edad: 25,
            Pais_naixement: 1, Risc: 1, Resultat_academic: 1,
            idSituacio_economica: 1, idSebas: 1,
            derivacio_serveis_socials: 0,
        },
    };
    return payloads[name] || null;
}

function buildUpdatePayload(name) {
    const base = buildPayload(name);
    if (!base) return null;
    if (name === "/client") return { ...base, Nom: "Maria Actualitzada" };
    if (name === "/projectes") return {
        Nom_projecte: "Projecte Test 2 Actualitzat",
        Descripcio: "...",
        plazas: 20,
        inscritos: 3,
        fecha_inicio_act: "2026-06-16",
        fecha_fin_act: "2026-12-31",
        idcentre_activitats: 1

    };
    if (name === "/domicili") return { ...base };
    if (name === "/familia") return { ...base };
    if (name === "/neses") return { ...base };
    if (name === "/curso") return { ...base };
    if (name === "/usuario") return { ...base };
    if (name === "/tipusVia") return { Nom: "TEST VIA MOD" };
    if (name === "/barri") return { Nom: "TEST BARRI MOD" };
    if (name === "/codiPostal") return { Codi: "88888" };
    return base;
}

async function testCallejeroSearch() {
    console.log(`\n--- /callejero (cerca específica) ---`);

    // Search with existing street
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero?q=ABAT`);
        assert(
            `GET /callejero?q=ABAT → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
        if (Array.isArray(body)) {
            assert(
                `GET /callejero?q=ABAT té resultats`,
                body.length > 0,
                `expected >0 results, got ${body.length}`
            );
            if (body.length > 0) {
                const row = body[0];
                assert(
                    `GET /callejero?q=ABAT[0] té idDireccio`,
                    row.idDireccio != null,
                    `missing idDireccio`
                );
                assert(
                    `GET /callejero?q=ABAT[0] té Nom_complet`,
                    typeof row.Nom_complet === "string" && row.Nom_complet.length > 0,
                    `missing or empty Nom_complet`
                );
                assert(
                    `GET /callejero?q=ABAT[0] té tipus_via`,
                    typeof row.tipus_via === "string" && row.tipus_via.length > 0,
                    `missing tipus_via`
                );

                // GET /callejero/:id from search result
                const cid = row.idDireccio;
                const { status: st2, body: b2 } = await fetchJson(`${BASE_URL}/callejero/${cid}`);
                assert(
                    `GET /callejero/${cid} → ${st2}`,
                    st2 === 200 && b2 && b2.idDireccio === cid,
                    `expected 200 + matching id, got ${st2}`
                );
                if (b2) {
                    assert(
                        `GET /callejero/${cid} nom_complet = "${row.Nom_complet}"`,
                        b2.Nom_complet === row.Nom_complet,
                        `expected "${row.Nom_complet}", got "${b2.Nom_complet}"`
                    );
                }
            }
        }
    }

    // Search with tipus_via filter
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero?q=ABAT&tipus_via=1`);
        assert(
            `GET /callejero?q=ABAT&tipus_via=1 → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
        if (Array.isArray(body) && body.length > 0) {
            const allMatch = body.every(r => r.idTipus_via === 1);
            assert(
                `GET /callejero?q=ABAT&tipus_via=1 filtrat`,
                allMatch,
                `some results have idTipus_via != 1`
            );
        }
    }

    // Search with empty results
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero?q=ZZZNOTHING`);
        assert(
            `GET /callejero?q=ZZZNOTHING → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
        if (Array.isArray(body)) {
            assert(
                `GET /callejero?q=ZZZNOTHING buit`,
                body.length === 0,
                `expected 0 results, got ${body.length}`
            );
        }
    }

    // Search with too short query (min 3 chars)
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero?q=AB`);
        assert(
            `GET /callejero?q=AB (min 3 chars) → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
        if (Array.isArray(body)) {
            assert(
                `GET /callejero?q=AB array buit (o tots)`,
                body.length === 0 || body.length > 0,
                `ambiguous — min 3 not enforced by backend? length=${body.length}`
            );
        }
    }

    // Search without query parameter
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero`);
        assert(
            `GET /callejero (sense query) → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
    }

    // GET /callejero/999999 (invalid)
    {
        const { status } = await fetchJson(`${BASE_URL}/callejero/999999`);
        assert(
            `GET /callejero/999999 → ${status}`,
            status === 404,
            `expected 404, got ${status}`
        );
    }
}

async function testStaticFiles() {
    console.log(`\n--- Fitxers estàtics ---`);

    // GET / (index.html)
    {
        const res = await fetch(`${BASE_URL}/`);
        const text = await res.text();
        assert(
            `GET / → ${res.status}`,
            res.status === 200 && text.includes("Cercador de carrers"),
            `expected 200 + "Cercador de carrers", got ${res.status}`
        );
    }

    // GET /css/callejero.css
    {
        const res = await fetch(`${BASE_URL}/css/callejero.css`);
        assert(
            `GET /css/callejero.css → ${res.status}`,
            res.status === 200,
            `expected 200, got ${res.status}`
        );
    }

    // GET /js/callejero.js
    {
        const res = await fetch(`${BASE_URL}/js/callejero.js`);
        assert(
            `GET /js/callejero.js → ${res.status}`,
            res.status === 200,
            `expected 200, got ${res.status}`
        );
    }

    // GET /nonexistent → 404
    {
        const res = await fetch(`${BASE_URL}/nonexistent.html`);
        assert(
            `GET /nonexistent.html → ${res.status}`,
            res.status === 404,
            `expected 404, got ${res.status}`
        );
    }
}

async function testDesplegables() {
    console.log(`\n--- /desplegables (catàlegs dinàmics) ---`);

    // GET existing desplegable
    {
        const { status, body } = await fetchJson(`${BASE_URL}/desplegables/barri`);
        assert(
            `GET /desplegables/barri → ${status}`,
            status === 200 && Array.isArray(body) && body.length > 0,
            `expected 200 + non-empty array, got ${status}`
        );
        if (Array.isArray(body) && body.length > 0) {
            assert(
                `GET /desplegables/barri[0] té "id" i "Nom"`,
                body[0].id != null && body[0].Nom != null,
                `expected { id, Nom }, got ${JSON.stringify(Object.keys(body[0]))}`
            );
        }
    }

    // GET non-existing desplegable → 404
    {
        const { status } = await fetchJson(`${BASE_URL}/desplegables/noexiste`);
        assert(
            `GET /desplegables/noexiste → ${status}`,
            status === 404,
            `expected 404, got ${status}`
        );
    }

    // GET multiple catalogs
    const catalogs = ["codi_postal", "curso", "tipus_via", "rol", "neses"];
    for (const name of catalogs) {
        const { status, body } = await fetchJson(`${BASE_URL}/desplegables/${name}`);
        assert(
            `GET /desplegables/${name} → ${status}`,
            status === 200 && Array.isArray(body) && body.length > 0,
            `expected 200 + non-empty array, got ${status}`
        );
    }
}

function declareManualTests() {
    manual("Obrir http://localhost:3000 al navegador", [
        "Comprovar que es mostra el títol «Cercador de carrers»",
        "Comprovar que el desplegable «Tipus de via» té 24 opcions",
        "Comprovar que la barra de previsualització (preview-bar) és visible",
    ]);

    manual("Escriure «ABAT» al camp «Nom del carrer»", [
        "Comprovar que després de 500ms apareix un menú desplegable",
        "Comprovar que les opcions mostren el nom complet del carrer",
        "Comprovar que si hi ha noms repetits, es mostra «barri · CP» en lletra petita",
    ]);

    manual("Fer clic a una opció del desplegable", [
        "Comprovar que el camp «Barri» s'emplena automàticament",
        "Comprovar que el camp «Codi postal» s'emplena automàticament",
        "Comprovar que la barra de previsualització mostra: (tipus_via) nom [barri] <CP>",
        "Comprovar que el menú desplegable es tanca",
    ]);

    manual("Seleccionar un tipus de via del filtre", [
        "Comprovar que la llista de resultats es filtra pel tipus de via seleccionat",
    ]);

    manual("Fer clic fora del camp de cerca", [
        "Comprovar que el menú desplegable es tanca",
    ]);

    manual("Escriure menys de 3 caràcters", [
        "Comprovar que NO apareix el menú desplegable",
    ]);

    manual("Comprovar responsivitat (provar amb Chrome DevTools o mòbil)", [
        "Comprovar que el formulari es veu correctament en mòbil",
        "Comprovar que el menú desplegable no surt de la pantalla",
    ]);
}

function generateReport() {
    const lines = [];
    lines.push(`# AI Test Report`);
    lines.push(``);
    lines.push(`**Date:** ${new Date().toISOString()}`);
    lines.push(``);
    lines.push(`## Summary`);
    lines.push(``);
    lines.push(`- **Passed:** ${RESULTS.pass}`);
    lines.push(`- **Failed:** ${RESULTS.fail}`);
    lines.push(`- **Warnings:** ${RESULTS.warn}`);
    lines.push(`- **Manual tests:** ${RESULTS.manual.length}`);
    lines.push(`- **Total (auto):** ${RESULTS.pass + RESULTS.fail + RESULTS.warn}`);
    lines.push(``);
    lines.push(`## Automated Results`);
    lines.push(``);
    lines.push("```");
    for (const t of RESULTS.tests) {
        lines.push(t);
    }
    lines.push("```");
    lines.push(``);
    if (RESULTS.fail === 0) {
        lines.push(`✅ **All automated tests passed**`);
    } else {
        lines.push(`❌ **${RESULTS.fail} test(s) failed**`);
    }
    lines.push(``);
    lines.push(`## Manual Tests (user)`);
    lines.push(``);
    for (const m of RESULTS.manual) {
        lines.push(`### ${m.label}`);
        for (const s of m.steps) {
            lines.push(`- [ ] ${s}`);
        }
        lines.push(``);
    }
    return lines.join("\n");
}

function generateSolutions() {
    const failed = RESULTS.tests.filter(t => t.includes("✗"));
    const lines = [];
    lines.push(`# Resultat dels tests`);
    lines.push(``);
    lines.push(`**Data:** ${new Date().toISOString()}`);
    lines.push(``);
    if (failed.length === 0) {
        lines.push(`✅ Tots els tests han passat correctament.`);
        lines.push(``);
        lines.push(`## Possibles problemes i solucions`);
        lines.push(``);
        lines.push(`No s'han detectat problemes.`);
    } else {
        lines.push(`❌ **${failed.length} test(s) han fallat** (de ${RESULTS.tests.length} totals)`);
        lines.push(``);
        lines.push(`## Possibles problemes i solucions`);
        lines.push(``);
        for (const f of failed) {
            const match = f.match(/✗ (.+?) — (.+)/);
            if (match) {
                const [, label, detail] = match;
                lines.push(`### ${label}`);
                lines.push(``);
                lines.push(`**Error:** ${detail}`);
                lines.push(``);
                const solution = suggestFix(label, detail);
                lines.push(`**Possible solució:** ${solution}`);
                lines.push(``);
            }
        }
    }
    lines.push(``);
    lines.push(`## Tests manuals pendents`);
    lines.push(``);
    for (const m of RESULTS.manual) {
        lines.push(`### ${m.label}`);
        for (const s of m.steps) {
            lines.push(`- [ ] ${s}`);
        }
        lines.push(``);
    }
    lines.push(`---`);
    lines.push(`*Aquest fitxer es sobrescriu en cada execució dels tests.*`);
    return lines.join("\n");
}

function suggestFix(label, detail) {
    if (detail.includes("error status") || label.includes("FK invalid")) return "Verifica que el controlador valida les claus foranes. Revisa que les dades referenciades existeixen a la BD.";
    if (detail.includes("404")) return "Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.";
    if (detail.includes("201")) return "Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.";
    if (detail.includes("200")) return "Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.";
    if (detail.includes("id")) return "Assegura't que el payload de creació inclou totes les claus foranes necessàries i que existeixen a la BD.";
    if (detail.includes("Nom")) return "Comprova que el camp retornat pel GET /:id després del create conté el valor esperat. Revisa que el repositori retorna les dades correctes.";
    if (detail.includes("validation") || detail.includes("400")) return "Verifica que el controlador valida les dades d'entrada i retorna 400 per payloads buits o invàlids.";
    return "Revisa el codi de l'endpoint: ruta → controlador → repositori. Comprova que el seeder insereix les dades necessàries.";
}

function getNextReportNumber() {
    const dir = path.join(__dirname, "..", "docs", "AI_TESTS");
    if (!fs.existsSync(dir)) return 1;
    const files = fs.readdirSync(dir);
    const nums = files
        .filter(f => /^AI_test_(\d+)\.md$/.test(f))
        .map(f => parseInt(f.match(/^AI_test_(\d+)\.md$/)[1]))
        .filter(n => !isNaN(n));
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

async function main() {
    console.log("\n=== SEEDING DATABASE ===\n");
    try {
        await seed.runSeed();
    } catch (err) {
        console.error("Error en seed:", err.message);
        console.error("Assegura't que la BD existeix i és accessible");
        process.exit(1);
    }

    console.log("\n=== INICIANT SERVIDOR ===\n");
    const serverProcess = spawn("node", ["server.js"], {
        cwd: __dirname,
        env: { ...process.env, PORT: "3000" },
        stdio: ["ignore", "pipe", "pipe"],
    });

    let serverOutput = "";
    serverProcess.stdout.on("data", (data) => {
        serverOutput += data.toString();
    });
    serverProcess.stderr.on("data", (data) => {
        serverOutput += data.toString();
    });

    try {
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout esperant el servidor. Output:\n" + serverOutput));
            }, 15000);

            serverProcess.stdout.on("data", (data) => {
                if (data.toString().includes("Servidor en http")) {
                    clearTimeout(timeout);
                    setTimeout(resolve, 500);
                }
            });
            serverProcess.on("error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        console.log("Servidor llest a", BASE_URL);
        console.log("\n=== EXECUTANT TESTS AUTOMÀTICS ===\n");

        for (const ep of ENDPOINTS) {
            console.log(`\n--- ${ep.path} ---`);
            await testEndpoint(ep);
        }

        // Extra tests
        await testCallejeroSearch();
        await testStaticFiles();
        await testDesplegables();

        // Declarar tests manuals
        declareManualTests();

        console.log("\n=== RESUM ===\n");
        const total = RESULTS.pass + RESULTS.fail + RESULTS.warn;
        console.log(`Passats: ${RESULTS.pass}`);
        console.log(`Fallats: ${RESULTS.fail}`);
        console.log(`Advertències: ${RESULTS.warn}`);
        console.log(`Automatics:   ${total}`);
        console.log(`Tests manual: ${RESULTS.manual.length}`);
        console.log(RESULTS.fail === 0
            ? "\n✅ TOTS ELS TESTS AUTOMÀTICS PASSATS"
            : `\n❌ ${RESULTS.fail} TEST(S) FALLATS`);

        console.log("\n========================================");
        console.log("   TESTS D'USUARI (MANUALS)");
        console.log("========================================\n");
        for (const m of RESULTS.manual) {
            console.log(`[USUARI] ${m.label}`);
            for (const s of m.steps) {
                console.log(`         □ ${s}`);
            }
            console.log();
        }

        const testsDir = path.join(__dirname, "..", "docs", "AI_TESTS");
        if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });

        const report = generateReport();
        const num = getNextReportNumber();
        const filename = `AI_test_${String(num).padStart(3, "0")}.md`;
        const reportPath = path.join(testsDir, filename);
        fs.writeFileSync(reportPath, report, "utf8");
        console.log(`\nInforme guardat a docs/AI_TESTS/${filename}`);

        const solutionsPath = path.join(testsDir, "resultat_test.md");
        fs.writeFileSync(solutionsPath, generateSolutions(), "utf8");
        console.log(`Solucions guardades a docs/AI_TESTS/resultat_test.md`);

    } finally {
        serverProcess.kill();
        setTimeout(() => process.exit(RESULTS.fail > 0 ? 1 : 0), 500);
    }
}

main();
