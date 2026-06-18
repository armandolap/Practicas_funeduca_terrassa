const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const envPath = path.resolve(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
    console.error("ERROR: No s'ha trobat el fitxer .env a l'arrel del projecte.");
    process.exit(1);
}

require("dotenv").config({ path: envPath });

const BASE_URL = "http://localhost:3000";

const RESULTS = { pass: 0, fail: 0, warn: 0, tests: [] };

function assert(label, ok, detail) {
    if (ok) {
        RESULTS.pass++;
        RESULTS.tests.push(`  \x1b[32m✓\x1b[0m ${label}`);
        console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    } else {
        RESULTS.fail++;
        RESULTS.tests.push(`  \x1b[31m✗\x1b[0m ${label} — ${detail}`);
        console.log(`  \x1b[31m✗\x1b[0m ${label} — ${detail}`);
    }
}

function warn(label, detail) {
    RESULTS.warn++;
    RESULTS.tests.push(`  \x1b[33m⚠\x1b[0m ${label} — ${detail}`);
    console.log(`  \x1b[33m⚠\x1b[0m ${label} — ${detail}`);
}

let AUTH_TOKEN = null;

async function fetchJson(url, options = {}) {
    const headers = { "Content-Type": "application/json" };
    if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
    if (options.headers) Object.assign(headers, options.headers);
    const res = await fetch(url, { ...options, headers });
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

async function getAuthToken() {
    const { status, body } = await fetchJson(`${BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ username: "usuari", password: "1234" }),
    });
    if (status === 200 && body?.token) {
        AUTH_TOKEN = body.token;
        return true;
    }
    return false;
}

// ── HELPERS ──

function expectError(label, status, expectedRange = [400, 499]) {
    const ok = status >= expectedRange[0] && status <= expectedRange[1];
    assert(label, ok,
        `esperat ${expectedRange[0]}-${expectedRange[1]}, obtingut ${status}`);
}

function expect(label, status, expected) {
    assert(label, status === expected,
        `esperat ${expected}, obtingut ${status}`);
}

// ── TEST SUITES ──

async function test_01_MissingRequiredFields() {
    console.log(`\n--- 1. Missing required fields ---`);

    // 1.1 POST /projectes {}
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /projectes {} → 400", status, [400, 499]);
    }

    // 1.2 POST /projectes {projecte:{}}
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST", body: JSON.stringify({ projecte: {} }),
        });
        expectError("POST /projectes {projecte:{}} → 400", status, [400, 499]);
    }

    // 1.3 POST /projectes empty Nom_projecte
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({ projecte: { Nom_projecte: "", idcentre_activitats: 1 } }),
        });
        expectError("POST /projectes empty Nom → 400", status, [400, 499]);
    }

    // 1.4 POST /client/full {}
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /client/full {} → 400", status, [400, 499]);
    }

    // 1.5 POST /client/full empty nested
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({ client: {}, familia: {}, domicili: {} }),
        });
        expectError("POST /client/full empty nested → 400", status, [400, 499]);
    }

    // 1.6 POST /client {}
    {
        const { status } = await fetchJson(`${BASE_URL}/client`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /client {} → 400", status, [400, 499]);
    }

    // 1.7 POST /client empty Nom
    {
        const { status } = await fetchJson(`${BASE_URL}/client`, {
            method: "POST", body: JSON.stringify({ Nom: "" }),
        });
        expectError("POST /client empty Nom → 400", status, [400, 499]);
    }

    // 1.8 POST / familia empty Cognom_familiar
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST", body: JSON.stringify({ Cognom_familiar: "" }),
        });
        expectError("POST /familia empty Cognom → 400", status, [400, 499]);
    }

    // 1.9 POST /usuario {}
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /usuario {} → 400", status, [400, 499]);
    }

    // 1.10 POST /domicili {}
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /domicili {} → 400", status, [400, 499]);
    }

    // 1.11 POST /auth/login {}
    {
        const { status } = await fetchJson(`${BASE_URL}/auth/login`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /auth/login {} → 400", status, [400, 499]);
    }

    // 1.12 PUT /client/:id/full empty body
    {
        const { status } = await fetchJson(`${BASE_URL}/client/1/full`, {
            method: "PUT", body: JSON.stringify({}),
        });
        expectError("PUT /client/1/full {} → 400", status, [400, 499]);
    }

    // 1.13 POST /tipusVia {}
    {
        const { status } = await fetchJson(`${BASE_URL}/tipusVia`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /tipusVia {} → 400", status, [400, 499]);
    }

    // 1.14 POST /barri {}
    {
        const { status } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /barri {} → 400", status, [400, 499]);
    }

    // 1.15 POST /codiPostal {}
    {
        const { status } = await fetchJson(`${BASE_URL}/codiPostal`, {
            method: "POST", body: JSON.stringify({}),
        });
        expectError("POST /codiPostal {} → 400", status, [400, 499]);
    }
}

async function test_02_InvalidForeignKeys() {
    console.log(`\n--- 2. Invalid foreign keys ---`);

    // 2.1 POST /client/full with invalid idGenere
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "FK Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 999, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12, derivacio_serveis_socials: 0,
                    Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full idGenere=999 → error", status, [400, 500]);
    }

    // 2.2 POST /client/full with invalid familia.idFamilia
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "FK Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12, derivacio_serveis_socials: 0,
                    Data_d_alta: "2024-01-01"
                },
                familia: { idFamilia: 999999 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full familia=999999 → error", status, [400, 500]);
    }

    // 2.3 POST /client/full with invalid domicili.idDomicili
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "FK Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12, derivacio_serveis_socials: 0,
                    Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idDomicili: 999999 }
            }),
        });
        expectError("POST /client/full domicili=999999 → error", status, [400, 500]);
    }

    // 2.4 POST /projectes invalid idcentre_activitats
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({ projecte: { Nom_projecte: "Test", idcentre_activitats: 999 } }),
        });
        expectError("POST /projectes centre=999 → error", status, [400, 500]);
    }

    // 2.5 POST /domicili invalid Tipus_domicili
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili`, {
            method: "POST",
            body: JSON.stringify({ Tipus_domicili: 999, Direccio: 1 }),
        });
        expectError("POST /domicili tipus=999 → error", status, [400, 500]);
    }

    // 2.6 POST /domicili invalid Direccio
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili`, {
            method: "POST",
            body: JSON.stringify({ Tipus_domicili: 1, Direccio: 999999 }),
        });
        expectError("POST /domicili direccio=999999 → error", status, [400, 500]);
    }

    // 2.7 POST /familia invalid Estructura_familiar
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            body: JSON.stringify({ Cognom_familiar: "FKTest", Estructura_familiar: 999 }),
        });
        expectError("POST /familia estr=999 → error", status, [400, 500]);
    }

    // 2.8 POST /usuario invalid idNivel_acceso
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST",
            body: JSON.stringify({ idNivel_acceso: 999, Nom: "Test", Cognoms: "Test", username: "fk_test", password: "Test1234!" }),
        });
        expectError("POST /usuario nivell=999 → error", status, [400, 500]);
    }

    // 2.9 POST /projectes/:id/clients invalid clientIds
    {
        // First create a project so we have one
        const { body: proj } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({ projecte: { Nom_projecte: "FK Test Proj", idcentre_activitats: 1 } }),
        });
        if (proj?.id) {
            const { status } = await fetchJson(`${BASE_URL}/projectes/${proj.id}/clients`, {
                method: "POST",
                body: JSON.stringify({ clientIds: [999999] }),
            });
            expectError("POST /projectes/:id/clients clientId=999999 → error", status, [400, 500]);
            // Clean up
            await fetchJson(`${BASE_URL}/projectes/${proj.id}`, { method: "DELETE" });
        } else {
            warn("POST /projectes per test 2.9", `no s'ha pogut crear projecte: ${JSON.stringify(proj)}`);
        }
    }
}

async function test_03_DuplicateUnique() {
    console.log(`\n--- 3. Duplicate unique constraints ---`);

    // 3.1 Duplicate username
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST",
            body: JSON.stringify({ idNivel_acceso: 1, Nom: "Dup", Cognoms: "Test", username: "usuari", password: "Test1234!" }),
        });
        expectError("POST /usuario username=usuari (duplicat) → 409/500", status, [400, 500]);
    }

    // 3.2 Duplicate family name (Cognom_familiar is UNIQUE)
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            body: JSON.stringify({ Cognom_familiar: "Garcia", Estructura_familiar: 1 }),
        });
        expectError("POST /familia Cognom=Garcia (duplicat) → 409/500", status, [400, 500]);
    }

    // 3.3 Duplicate tipus_via
    {
        const { status } = await fetchJson(`${BASE_URL}/tipusVia`, {
            method: "POST",
            body: JSON.stringify({ Nom: "CARRER" }),
        });
        expectError("POST /tipusVia Nom=CARRER (duplicat) → 409/500", status, [400, 500]);
    }

    // 3.4 Duplicate barri
    {
        const { status } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            body: JSON.stringify({ Nom: "CENTRE" }),
        });
        expectError("POST /barri Nom=CENTRE (duplicat) → 409/500", status, [400, 500]);
    }

    // 3.5 Duplicate codi_postal
    {
        const { status } = await fetchJson(`${BASE_URL}/codiPostal`, {
            method: "POST",
            body: JSON.stringify({ Codi: "08225" }),
        });
        expectError("POST /codiPostal Codi=08225 (duplicat) → 409/500", status, [400, 500]);
    }
}

async function test_04_SQLInjection() {
    console.log(`\n--- 4. SQL injection ---`);

    // 4.1 POST /client/full SQL injection in name
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Robert'; DROP TABLE client;--",
                    Cognoms: "Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        assert("POST /client/full SQL injection Nom → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }

    // 4.2 SQL injection OR attack
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "' OR '1'='1", Cognoms: "Test",
                    Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        assert("POST /client/full SQL injection OR → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }

    // 4.3 POST /projectes SQL injection
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: {
                    Nom_projecte: "'; DELETE FROM proyectos;--",
                    idcentre_activitats: 1
                }
            }),
        });
        assert("POST /projectes SQL injection → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }

    // 4.4 POST /familia SQL injection
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            body: JSON.stringify({
                Cognom_familiar: "'; SELECT * FROM client;--",
                Estructura_familiar: 1
            }),
        });
        assert("POST /familia SQL injection → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }

    // 4.5 GET /client?q= SQL injection
    {
        const { status } = await fetchJson(`${BASE_URL}/client?q=' OR 1=1 --`);
        expect("GET /client?q=SQLi → 200 (no crash)", status, 200);
    }

    // 4.6 GET /projectes?q= SQL injection
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes?q='; DROP TABLE --`);
        expect("GET /projectes?q=SQLi → 200 (no crash)", status, 200);
    }
}

async function test_05_XSS() {
    console.log(`\n--- 5. XSS / HTML injection ---`);

    // 5.1 POST /client/full XSS
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "<script>alert('xss')</script>",
                    Cognoms: "Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        assert("POST /client/full XSS → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }

    // 5.2 POST /projectes XSS
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: {
                    Nom_projecte: "<img src=x onerror=alert(1)>",
                    idcentre_activitats: 1
                }
            }),
        });
        assert("POST /projectes XSS → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }

    // 5.3 POST /familia XSS
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            body: JSON.stringify({
                Cognom_familiar: "<svg onload=alert(1)>",
                Estructura_familiar: 6
            }),
        });
        assert("POST /familia XSS → 201 o error (no crash)",
            status >= 400 || status === 201,
            `status inesperat: ${status}`);
    }
}

async function test_06_WrongDataTypes() {
    console.log(`\n--- 6. Tipus de dades incorrectes ---`);

    // 6.1 String instead of number for idGenere
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: "not-a-number", idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full idGenere=string → 400", status, [400, 499]);
    }

    // 6.2 Invalid date format
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "Test", Fecha_nacimiento: "not-a-date",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full Fecha=string → 400", status, [400, 499]);
    }

    // 6.3 String for plazas
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: { Nom_projecte: "Test", idcentre_activitats: 1, plazas: "abc" }
            }),
        });
        expectError("POST /projectes plazas=string → 400", status, [400, 499]);
    }

    // 6.4 String for Tipus_domicili
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili`, {
            method: "POST",
            body: JSON.stringify({ Tipus_domicili: "string", Direccio: 1 }),
        });
        expectError("POST /domicili tipus=string → 400", status, [400, 499]);
    }

    // 6.5 String for Estructura_familiar
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            body: JSON.stringify({ Cognom_familiar: "Test", Estructura_familiar: "abc" }),
        });
        expectError("POST /familia estr=string → 400", status, [400, 499]);
    }

    // 6.6 Invalid date (Feb 30)
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "Test", Fecha_nacimiento: "2021-02-30",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full Fecha=2021-02-30 → 400", status, [400, 499]);
    }

    // 6.7 Empty date
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "Test", Fecha_nacimiento: "",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full Fecha='' → 400", status, [400, 499]);
    }
}

async function test_07_NegativeValues() {
    console.log(`\n--- 7. Valors negatius ---`);

    // 7.1 Negative plazas
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: { Nom_projecte: "Test", idcentre_activitats: 1, plazas: -1 }
            }),
        });
        expectError("POST /projectes plazas=-1 → 400", status, [400, 499]);
    }

    // 7.2 Zero plazas (0 is valid — no limit)
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: { Nom_projecte: "Test", idcentre_activitats: 1, plazas: 0 }
            }),
        });
        expect("POST /projectes plazas=0 → 201", status, 201);
    }
}

async function test_08_VeryLongStrings() {
    console.log(`\n--- 8. Strings molt llargues ---`);

    const long = "A".repeat(10000);

    // 8.1 POST /client/full long Nom
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: long, Cognoms: "Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full Nom 10000 chars → 400", status, [400, 499]);
    }

    // 8.2 POST /projectes long Nom_projecte
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: { Nom_projecte: long, idcentre_activitats: 1 }
            }),
        });
        expectError("POST /projectes Nom 10000 chars → 400", status, [400, 499]);
    }

    // 8.3 POST /familia long Cognom
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            body: JSON.stringify({
                Cognom_familiar: long, Estructura_familiar: 1
            }),
        });
        expectError("POST /familia Cognom 10000 chars → 400", status, [400, 499]);
    }

    // 8.4 POST /usuario long username
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST",
            body: JSON.stringify({
                idNivel_acceso: 1, Nom: "Test", Cognoms: "Test",
                username: long, password: "Test1234!"
            }),
        });
        expectError("POST /usuario username 10000 chars → 400", status, [400, 499]);
    }
}

async function test_09_MalformedPayload() {
    console.log(`\n--- 9. Payload malformat ---`);

    // 9.1 Send raw text instead of JSON to /client/full
    {
        const res = await fetch(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: "not json at all",
        });
        expectError("POST /client/full raw text → 400", res.status, [400, 499]);
    }

    // 9.2 Nom_projecte = null
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({ projecte: { Nom_projecte: null, idcentre_activitats: 1 } }),
        });
        expectError("POST /projectes Nom=null → 400", status, [400, 499]);
    }

    // 9.3 Body = null
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
        });
        // No body sent at all
        expectError("POST /familia sense body → 400", status, [400, 499]);
    }

    // 9.4 client is array
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({ client: [], familia: { Estructura_familiar: 1 }, domicili: { idcallejero: 1 } }),
        });
        expectError("POST /client/full client=[] → 400", status, [400, 499]);
    }
}

async function test_10_Authorization() {
    console.log(`\n--- 10. Autorització ---`);

    const savedToken = AUTH_TOKEN;
    AUTH_TOKEN = null;

    // 10.1 POST /projectes sense token
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({}),
        });
        expect("POST /projectes sense token → 401", status, 401);
    }

    // 10.2 PUT /projectes/1 sense token
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes/1`, {
            method: "PUT",
            body: JSON.stringify({}),
        });
        expect("PUT /projectes/1 sense token → 401", status, 401);
    }

    // 10.3 DELETE /projectes/1 sense token
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes/1`, {
            method: "DELETE",
        });
        expect("DELETE /projectes/1 sense token → 401", status, 401);
    }

    // 10.4 POST /projectes/:id/clients sense token
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes/1/clients`, {
            method: "POST",
            body: JSON.stringify({ clientIds: [1] }),
        });
        expect("POST /projectes/:id/clients sense token → 401", status, 401);
    }

    // 10.5 GET /auth/me sense token
    {
        const { status } = await fetchJson(`${BASE_URL}/auth/me`);
        expect("GET /auth/me sense token → 401", status, 401);
    }

    // 10.6 GET /auth/me token invàlid
    {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: "Bearer invalid_token_here" },
        });
        expect("GET /auth/me token invalid → 401", res.status, 401);
    }

    AUTH_TOKEN = savedToken;
}

async function test_11_DeleteConflicts() {
    console.log(`\n--- 11. DELETE conflicts ---`);

    // 11.1 DELETE /familia/:id amb clients (FK NO ACTION)
    {
        const { status } = await fetchJson(`${BASE_URL}/familia/1`, { method: "DELETE" });
        expectError("DELETE /familia/1 amb clients → error (FK)", status, [400, 500]);
    }

    // 11.2 DELETE /domicili/:id amb clients
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili/1`, { method: "DELETE" });
        expectError("DELETE /domicili/1 amb clients → error (FK)", status, [400, 500]);
    }

    // 11.3 DELETE /projectes/:id amb responsables (repo handles cascade)
    {
        // Create a project with responsable, then delete it
        const { body: proj } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: { Nom_projecte: "Cascade Test", idcentre_activitats: 1, responsable_zona: 1 }
            }),
        });
        if (proj?.id) {
            const { status } = await fetchJson(`${BASE_URL}/projectes/${proj.id}`, { method: "DELETE" });
            expect("DELETE /projectes amb responsables → 200", status, 200);
        } else {
            warn("DELETE cascade test", `no s'ha pogut crear projecte`);
        }
    }

    // 11.4 DELETE /usuario/:id que és responsable (repo cascades → 200)
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario/3`, { method: "DELETE" });
        expect("DELETE /usuario/3 (responsable) → 200", status, 200);
    }
}

async function test_12_InvalidDates() {
    console.log(`\n--- 12. Dates invàlides ---`);

    // 12.1 Project with end < start
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes`, {
            method: "POST",
            body: JSON.stringify({
                projecte: {
                    Nom_projecte: "Test",
                    idcentre_activitats: 1,
                    fecha_inicio_act: "2020-01-01",
                    fecha_fin_act: "2019-01-01"
                }
            }),
        });
        expectError("POST /projectes fi<inici → 400", status, [400, 499]);
    }

    // 12.2 Client with future alta date
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "Test", Fecha_nacimiento: "2000-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2099-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full Data_alta=2099 → 400", status, [400, 499]);
    }

    // 12.3 Client with future birth date
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            body: JSON.stringify({
                client: {
                    Nom: "Test", Cognoms: "Test", Fecha_nacimiento: "2099-01-01",
                    idGenere: 1, idRol: 3, idSituacio_economica: 1,
                    Pais_naixement: 1, Risc: 1, idSebas: 12,
                    derivacio_serveis_socials: 0, Data_d_alta: "2024-01-01"
                },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1 }
            }),
        });
        expectError("POST /client/full Fecha_nac=2099 → 400", status, [400, 499]);
    }
}

async function test_13_NoBody() {
    console.log(`\n--- 13. PUT sense body ---`);

    // 13.1 PUT /client/1 sense body
    {
        const { status } = await fetchJson(`${BASE_URL}/client/1`, { method: "PUT" });
        expectError("PUT /client/1 sense body → 400", status, [400, 499]);
    }

    // 13.2 PUT /familia/1 sense body
    {
        const { status } = await fetchJson(`${BASE_URL}/familia/1`, { method: "PUT" });
        expectError("PUT /familia/1 sense body → 400", status, [400, 499]);
    }

    // 13.3 PUT /domicili/1 sense body
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili/1`, { method: "PUT" });
        expectError("PUT /domicili/1 sense body → 400", status, [400, 499]);
    }

    // 13.4 PUT /usuario/1 sense body
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario/1`, { method: "PUT" });
        expectError("PUT /usuario/1 sense body → 400", status, [400, 499]);
    }
}

async function test_15_NonExistentIds() {
    console.log(`\n--- 15. IDs inexistents ---`);

    // 15.1 GET /client/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/client/999999`);
        expect("GET /client/999999 → 404", status, 404);
    }

    // 15.2 PUT /client/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/client/999999`, {
            method: "PUT", body: JSON.stringify({ Nom: "Test" }),
        });
        expect("PUT /client/999999 → 404", status, 404);
    }

    // 15.3 DELETE /client/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/client/999999`, { method: "DELETE" });
        expect("DELETE /client/999999 → 404", status, 404);
    }

    // 15.4 GET /projectes/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes/999999`);
        expect("GET /projectes/999999 → 404", status, 404);
    }

    // 15.5 PUT /projectes/999999 (with auth)
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes/999999`, {
            method: "PUT",
            body: JSON.stringify({ projecte: { Nom_projecte: "Test", idcentre_activitats: 1 } }),
        });
        expect("PUT /projectes/999999 → 404", status, 404);
    }

    // 15.6 DELETE /projectes/999999 (with auth)
    {
        const { status } = await fetchJson(`${BASE_URL}/projectes/999999`, { method: "DELETE" });
        expect("DELETE /projectes/999999 → 404", status, 404);
    }

    // 15.7 GET /usuario/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario/999999`);
        expect("GET /usuario/999999 → 404", status, 404);
    }

    // 15.8 PUT /usuario/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario/999999`, {
            method: "PUT", body: JSON.stringify({ Nom: "Test" }),
        });
        expect("PUT /usuario/999999 → 404", status, 404);
    }

    // 15.9 DELETE /usuario/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario/999999`, { method: "DELETE" });
        expect("DELETE /usuario/999999 → 404", status, 404);
    }

    // 15.10 GET /familia/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/familia/999999`);
        expect("GET /familia/999999 → 404", status, 404);
    }

    // 15.11 PUT /familia/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/familia/999999`, {
            method: "PUT", body: JSON.stringify({ Cognom_familiar: "Test" }),
        });
        expect("PUT /familia/999999 → 404", status, 404);
    }

    // 15.12 DELETE /familia/999999
    {
        const { status } = await fetchJson(`${BASE_URL}/familia/999999`, { method: "DELETE" });
        expect("DELETE /familia/999999 → 404", status, 404);
    }
}

async function runAll() {
    console.log("=== DEVIL TESTS ===\n");

    const suites = [
        test_01_MissingRequiredFields,
        test_02_InvalidForeignKeys,
        test_03_DuplicateUnique,
        test_04_SQLInjection,
        test_05_XSS,
        test_06_WrongDataTypes,
        test_07_NegativeValues,
        test_08_VeryLongStrings,
        test_09_MalformedPayload,
        test_10_Authorization,
        test_11_DeleteConflicts,
        test_12_InvalidDates,
        test_13_NoBody,
        test_15_NonExistentIds,
    ];

    for (const suite of suites) {
        try {
            await suite();
        } catch (err) {
            console.error(`  \x1b[31mERROR in suite ${suite.name}:\x1b[0m ${err.message}`);
            RESULTS.fail++;
        }
    }

    console.log("\n=== RESUM ===\n");
    const total = RESULTS.pass + RESULTS.fail + RESULTS.warn;
    console.log(`Passats: ${RESULTS.pass}`);
    console.log(`Fallats: ${RESULTS.fail}`);
    console.log(`Advertències: ${RESULTS.warn}`);
    console.log(`Total: ${total}`);
    console.log(RESULTS.fail === 0
        ? "\n✅ TOTS ELS DEVIL TESTS PASSATS"
        : `\n❌ ${RESULTS.fail} TEST(S) FALLATS`);
}

function stripAnsi(str) {
    return str.replace(/\x1b\[\d+m/g, "");
}

function generateDevilReport() {
    const lines = [];
    lines.push(`# DEVIL Test Report`);
    lines.push(``);
    lines.push(`**Date:** ${new Date().toISOString()}`);
    lines.push(``);
    lines.push(`## Summary`);
    lines.push(``);
    lines.push(`- **Passed:** ${RESULTS.pass}`);
    lines.push(`- **Failed:** ${RESULTS.fail}`);
    lines.push(`- **Warnings:** ${RESULTS.warn}`);
    lines.push(`- **Total:** ${RESULTS.pass + RESULTS.fail + RESULTS.warn}`);
    lines.push(``);
    lines.push(`## Results`);
    lines.push(``);
    lines.push("```");
    for (const t of RESULTS.tests) {
        lines.push(stripAnsi(t));
    }
    lines.push("```");
    lines.push(``);
    if (RESULTS.fail === 0) {
        lines.push(`✅ **All DEVIL tests passed**`);
    } else {
        lines.push(`❌ **${RESULTS.fail} test(s) failed**`);
    }
    return lines.join("\n");
}

function generateDevilInform() {
    const failed = RESULTS.tests.filter(t => t.includes("✗"));
    const lines = [];
    lines.push(`# DEVIL Test Errors`);
    lines.push(``);
    lines.push(`**Date:** ${new Date().toISOString()}`);
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
        lines.push(`## Tests fallats`);
        lines.push(``);
        for (const f of failed) {
            lines.push(`- ${stripAnsi(f)}`);
        }
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(`*Aquest fitxer es sobrescriu en cada execució dels tests.*`);
    return lines.join("\n");
}

function writeDevilReports() {
    const dir = path.join(__dirname, "..", "docs", "AI_TESTS");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const lastPath = path.join(dir, "DEVIL_last.md");
    fs.writeFileSync(lastPath, generateDevilReport(), "utf8");
    console.log(`Informe guardat a docs/AI_TESTS/DEVIL_last.md`);

    const informPath = path.join(dir, "DEVIL_inform.md");
    fs.writeFileSync(informPath, generateDevilInform(), "utf8");
    console.log(`Solucions guardades a docs/AI_TESTS/DEVIL_inform.md`);
}

// ── MAIN ──

async function main() {
    let serverProcess;

    try {
        const serverPath = path.join(__dirname, "server.js");
        serverProcess = spawn("node", [serverPath], {
            stdio: ["ignore", "pipe", "pipe"],
        });

        serverProcess.stdout.on("data", () => {});
        serverProcess.stderr.on("data", () => {});

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout starting server")), 20000);
            serverProcess.stdout.on("data", (data) => {
                if (data.toString().includes("Servidor en http")) {
                    clearTimeout(timeout);
                    setTimeout(resolve, 500);
                }
            });
            serverProcess.on("error", reject);
        });

        console.log("Servidor llest a", BASE_URL);

        // Get auth token
        const gotToken = await getAuthToken();
        if (gotToken) {
            console.log("Token d'autenticació obtingut\n");
        } else {
            console.log("No s'ha pogut obtenir token, tests d'auth limitats\n");
        }

        await runAll();

        writeDevilReports();

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (serverProcess) serverProcess.kill();
        setTimeout(() => process.exit(RESULTS.fail > 0 ? 1 : 0), 500);
    }
}

main();
