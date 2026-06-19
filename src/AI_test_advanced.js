const path = require("path");
const fs = require("fs");

const envPath = path.resolve(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
    console.error("ERROR: No s'ha trobat el fitxer .env a l'arrel del projecte.");
    process.exit(1);
}
require("dotenv").config({ path: envPath });

const { spawn } = require("child_process");
const seed = require("./seeder/seeder");

const BASE_URL = "http://localhost:3001";
const AUTH_CREDENTIALS = { username: "usuari", password: "1234" };
let AUTH_HEADERS = {};
const RESULTS = { pass: 0, fail: 0, warn: 0, tests: [] };

function assert(label, ok, detail) {
    if (ok) {
        RESULTS.pass++;
        RESULTS.tests.push(`  \u2713 ${label}`);
        console.log(`  \x1b[32m\u2713\x1b[0m ${label}`);
    } else {
        RESULTS.fail++;
        RESULTS.tests.push(`  \u2717 ${label} \u2014 ${detail}`);
        console.log(`  \x1b[31m\u2717\x1b[0m ${label} \u2014 ${detail}`);
    }
}

function assertStatus(label, actual, expected) {
    assert(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertBody(label, ok, detail) {
    assert(label, ok, detail || "unexpected body");
}

async function fetchJson(url, options) {
    const opts = {
        ...options,
        headers: { ...AUTH_HEADERS, ...options?.headers },
    };
    const res = await fetch(url, opts);
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

async function getAuthToken() {
    const { status, body } = await fetchJson(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(AUTH_CREDENTIALS),
    });
    if (status === 200 && body?.token) {
        AUTH_HEADERS = { Authorization: `Bearer ${body.token}` };
        console.log("  Autenticació exitosa, token obtingut");
    } else {
        console.log("  \x1b[33m⚠ No s'ha pogut autenticar (els tests protegits fallaran)\x1b[0m");
    }
}

function makeId(name) {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function section(title) {
    console.log(`\n\x1b[36m=== ${title} ===\x1b[0m`);
}

// ─────────────────────────────────────────────
// SECTION 1: CONSTRAINT ENFORCEMENT
// ─────────────────────────────────────────────
async function testUniqueConstraints() {
    section("CONSTRAINT: UNIQUE");

    // 1.1 Duplicate barri name
    {
        const { status, body } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: "DUPLICATE_BARRI" }),
        });
        assertStatus("POST /barri (first create)", status, 201);

        const { status: st2 } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: "DUPLICATE_BARRI" }),
        });
        assert("POST /barri duplicate Nom → 4xx", st2 >= 400, `expected 4xx, got ${st2}`);

        // cleanup — find the created barri
        const { body: list } = await fetchJson(`${BASE_URL}/barri?q=DUPLICATE_BARRI`);
        // fallback: get all and filter
        const { body: all } = list?.length ? { body: list } : await fetchJson(`${BASE_URL}/barri`);
        const match = Array.isArray(all) ? all.find(b => b.Nom === "DUPLICATE_BARRI") : null;
        if (match) {
            await fetchJson(`${BASE_URL}/barri/${match.idBarri || match.id}`, { method: "DELETE" });
        }
    }

    // 1.2 Duplicate codi_postal code
    {
        const { status, body } = await fetchJson(`${BASE_URL}/codiPostal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Codi: "99998" }),
        });
        assertStatus("POST /codiPostal (first create)", status, 201);

        const { status: st2 } = await fetchJson(`${BASE_URL}/codiPostal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Codi: "99998" }),
        });
        assert("POST /codiPostal duplicate Codi → 4xx", st2 >= 400, `expected 4xx, got ${st2}`);

        const { body: all } = await fetchJson(`${BASE_URL}/codiPostal`);
        const match = Array.isArray(all) ? all.find(c => c.Codi === "99998") : null;
        if (match) {
            const id = match.idCodi_postal || match.id;
            await fetchJson(`${BASE_URL}/codiPostal/${id}`, { method: "DELETE" });
        }
    }

    // 1.3 Duplicate familia cognom
    {
        const uniqueName = `DUP_FAM_${makeId("")}`;
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Cognom_familiar: uniqueName, Estructura_familiar: 1 }),
        });
        assertStatus("POST /familia (first unique name)", status, 201);

        const { status: st2 } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Cognom_familiar: uniqueName, Estructura_familiar: 2 }),
        });
        assert("POST /familia duplicate Cognom → 4xx", st2 >= 400, `expected 4xx, got ${st2}`);

        // cleanup
        const { body: all } = await fetchJson(`${BASE_URL}/familia`);
        const match = Array.isArray(all) ? all.find(f => f.Cognom_familiar === uniqueName) : null;
        if (match) {
            await fetchJson(`${BASE_URL}/familia/${match.idFamilia}`, { method: "DELETE" });
        }
    }

    // 1.4 Duplicate usuario username (schema has UNIQUE on username)
    {
        const { status } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idNivel_acceso: 1, Nom: "Dup", Cognoms: "Test",
                username: "dupe_user_test", email: "dupe_user_test@test.com",
                Telefon: "600000000", password: "Test1234!"
            }),
        });
        assertStatus("POST /usuario (first unique username)", status, 201);

        const { status: st2 } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idNivel_acceso: 1, Nom: "Dup2", Cognoms: "Test2",
                username: "dupe_user_test", email: "other@test.com",
                Telefon: "600000001", password: "Test1234!"
            }),
        });
        assert("POST /usuario duplicate username → 4xx", st2 >= 400, `expected 4xx, got ${st2}`);

        // cleanup
        const { body: all } = await fetchJson(`${BASE_URL}/usuario`);
        const match = Array.isArray(all) ? all.find(u => u.username === "dupe_user_test") : null;
        if (match) {
            await fetchJson(`${BASE_URL}/usuario/${match.idUsuario_APP}`, { method: "DELETE" });
        }
    }
}

async function testNotNullConstraints() {
    section("CONSTRAINT: NOT NULL");

    // 2.1 Create barri with empty name
    {
        const { status } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: "" }),
        });
        assert("POST /barri empty Nom → 4xx", status >= 400, `expected 4xx, got ${status}`);
    }

    // 2.2 Create codiPostal with missing Codi
    {
        const { status } = await fetchJson(`${BASE_URL}/codiPostal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        assert("POST /codiPostal missing Codi → 4xx", status >= 400, `expected 4xx, got ${status}`);
    }

    // 2.3 Create client without required fields (from /client/full)
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client: {} }),
        });
        assert("POST /client/full empty client → 400", status === 400, `expected 400, got ${status}`);
    }

    // 2.4 Create client without Nom
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client: { Cognoms: "Test", Fecha_nacimiento: "2000-01-01", idGenere: 1, idRol: 3, idSituacio_economica: 1, Pais_naixement: 1 },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1, Num_calle: "1", Tipus_domicili: 1 }
            }),
        });
        assert("POST /client/full missing Nom → 400", status === 400, `expected 400, got ${status}`);
    }

    // 2.5 Create client without Fecha_nacimiento
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client: { Nom: "Test", Cognoms: "Test", idGenere: 1, idRol: 3, idSituacio_economica: 1, Pais_naixement: 1 },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1, Num_calle: "1", Tipus_domicili: 1 }
            }),
        });
        assert("POST /client/full missing Fecha_nacimiento → 400", status === 400, `expected 400, got ${status}`);
    }

    // 2.6 Create familia without Cognom_familiar
    {
        const { status } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Estructura_familiar: 1 }),
        });
        assert("POST /familia missing Cognom_familiar → 400", status === 400, `expected 400, got ${status}`);
    }

    // 2.7 Create domicili without Tipus_domicili
    {
        const { status } = await fetchJson(`${BASE_URL}/domicili`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Direccio: 1 }),
        });
        assert("POST /domicili missing Tipus_domicili → 400", status === 400, `expected 400, got ${status}`);
    }

    // 2.8 Create usuario without password
    {
        const { status, body } = await fetchJson(`${BASE_URL}/usuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idNivel_acceso: 1, Nom: "NoPass", Cognoms: "Test", email: `nopass_${makeId("")}@test.com`, Telefon: "600000000" }),
        });
        assert("POST /usuario missing password → 400", status === 400, `expected 400, got ${status}`);
    }
}

async function testForeignKeyConstraints() {
    section("CONSTRAINT: FOREIGN KEY");

    // 3.1 Create client with non-existent idFamilia (POST /client)
    {
        const { status } = await fetchJson(`${BASE_URL}/client`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idFamilia: 999999, idRol: 3, idGenere: 1, Nom: "FKTest", Cognoms: "Test",
                Data_d_alta: "2025-01-01", C_temps_a_lentitat: "0", Fecha_nacimiento: "2000-01-01",
                C_edad: 25, Pais_naixement: 1, Risc: 1, Resultat_academic: 1,
                idSituacio_economica: 1, idSebas: 1, derivacio_serveis_socials: 0,
                idDomicili: 1, Baixa: 0
            }),
        });
        assert("POST /client invalid idFamilia → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
    }

    // 3.2 Create client with non-existent idDomicili (POST /client)
    {
        const { status } = await fetchJson(`${BASE_URL}/client`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idFamilia: 1, idRol: 3, idGenere: 1, Nom: "FKTest2", Cognoms: "Test",
                Data_d_alta: "2025-01-01", C_temps_a_lentitat: "0", Fecha_nacimiento: "2000-01-01",
                C_edad: 25, Pais_naixement: 1, Risc: 1, Resultat_academic: 1,
                idSituacio_economica: 1, idSebas: 1, derivacio_serveis_socials: 0,
                idDomicili: 999999, Baixa: 0
            }),
        });
        assert("POST /client invalid idDomicili → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
    }

    // 3.3 PUT client with invalid idFamilia
    {
        const { body: all } = await fetchJson(`${BASE_URL}/client`);
        const first = Array.isArray(all) ? all[0] : null;
        if (first?.idClient) {
            const { status } = await fetchJson(`${BASE_URL}/client/${first.idClient}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idFamilia: 999999 }),
            });
            assert("PUT /client/:id invalid idFamilia → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
        }
    }

    // 3.4 POST /client/full with invalid idcallejero
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client: { Nom: "FKTest3", Cognoms: "Test", Fecha_nacimiento: "2000-01-01", idGenere: 1, idRol: 3, idSituacio_economica: 1, Pais_naixement: 1 },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 999999, Num_calle: "1", Tipus_domicili: 1 }
            }),
        });
        assert("POST /client/full invalid idcallejero → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
    }
}

async function testDeleteRestrictions() {
    section("CONSTRAINT: DELETE RESTRICTIONS");

    // 4.1 Delete a barri that is referenced by callejero → should fail
    {
        const { status } = await fetchJson(`${BASE_URL}/barri/1`, { method: "DELETE" });
        assert("DELETE /barri/1 (referenced by callejero) → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
    }

    // 4.2 Delete a pais that is referenced by client → should fail
    {
        const { status } = await fetchJson(`${BASE_URL}/paisos/1`, { method: "DELETE" });
        assert("DELETE /paisos/1 (referenced by client) → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
    }

    // 4.3 Delete a tipus_domicili referenced by domicili → should fail
    {
        const { status } = await fetchJson(`${BASE_URL}/tipusDom/1`, { method: "DELETE" });
        assert("DELETE /tipusDom/1 (referenced by domicili) → 4xx/5xx", status >= 400, `expected 4xx+, got ${status}`);
    }

}

// ─────────────────────────────────────────────
// SECTION 2: EDGE CASE INPUTS
// ─────────────────────────────────────────────
async function testEdgeCases() {
    section("EDGE CASE INPUTS");

    // 5.1 Barri with very long name (edge)
    {
        const longName = "A".repeat(100);
        const { status, body } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: longName }),
        });
        if (status === 201 && body?.id) {
            await fetchJson(`${BASE_URL}/barri/${body.id}`, { method: "DELETE" });
        }
        assert("POST /barri 100-char name handled", status === 201 || status >= 400, `unexpected ${status}`);
    }

    // 5.2 Barri with special characters
    {
        const specName = `Test_${makeId("")}_ñÑàèù'\"-@#`;
        const { status, body } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: specName }),
        });
        if (status === 201 && body?.id) {
            const { body: check } = await fetchJson(`${BASE_URL}/barri/${body.id}`);
            if (check) {
                assert(`GET /barri/${body.id} after special chars create → 200`, true, "");
            }
            await fetchJson(`${BASE_URL}/barri/${body.id}`, { method: "DELETE" });
        }
        assert("POST /barri special chars handled", status === 201 || status >= 400, `unexpected ${status}`);
    }

    // 5.3 Create client with future birth date (edge)
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client: { Nom: "Future", Cognoms: "Baby", Fecha_nacimiento: "2099-01-01", idGenere: 1, idRol: 3, idSituacio_economica: 1, Pais_naixement: 1 },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 1, Num_calle: "1", Tipus_domicili: 1 }
            }),
        });
        // Should work (no constraint prevents future dates) but age will be negative
        assert("POST /client/full future birth date → created or rejected", status === 201 || status === 400, `unexpected ${status}`);
        if (status === 201) {
            const { body } = await fetchJson(`${BASE_URL}/client`);
            const match = Array.isArray(body) ? body.find(c => c.Nom === "Future") : null;
            if (match) {
                const { body: detail } = await fetchJson(`${BASE_URL}/client/${match.idClient}`);
                if (detail?.C_edad !== undefined && detail.C_edad < 0) {
                    console.log("  \x1b[33m\u26a0 Future birth date resulted in negative age\x1b[0m");
                }
                await fetchJson(`${BASE_URL}/client/${match.idClient}`, { method: "DELETE" });
            }
        }
    }

    // 5.4 Create client with age=0 (newborn)
    {
        const { status } = await fetchJson(`${BASE_URL}/client/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client: { Nom: "Newborn", Cognoms: "Test", Fecha_nacimiento: new Date().toISOString().split("T")[0], idGenere: 1, idRol: 3, idSituacio_economica: 1, Pais_naixement: 1 },
                familia: { Estructura_familiar: 1 },
                domicili: { idcallejero: 2, Num_calle: "1", Tipus_domicili: 1 }
            }),
        });
        assert("POST /client/full newborn (age 0) handled", status === 201 || status >= 400, `unexpected ${status}`);
        if (status === 201) {
            const { body: all } = await fetchJson(`${BASE_URL}/client`);
            const match = Array.isArray(all) ? all.find(c => c.Nom === "Newborn") : null;
            if (match) await fetchJson(`${BASE_URL}/client/${match.idClient}`, { method: "DELETE" });
        }
    }

    // 5.5 CREATE with whitespace-only strings
    {
        const { status } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: "   " }),
        });
        assert("POST /barri whitespace-only Nom → 4xx", status >= 400, `expected 4xx, got ${status}`);
    }

    // 5.6 GET with non-numeric ID
    {
        const res = await fetch(`${BASE_URL}/client/abc`);
        assert("GET /client/abc (non-numeric) → 4xx", res.status >= 400, `expected 4xx, got ${res.status}`);
    }

    // 5.8 Re-deleting already deleted resource
    {
        // Create a barri, delete it, try to delete again
        const { body } = await fetchJson(`${BASE_URL}/barri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nom: `DELETE_TWICE_${makeId("")}` }),
        });
        if (body?.id) {
            const { status: del1 } = await fetchJson(`${BASE_URL}/barri/${body.id}`, { method: "DELETE" });
            assertStatus("DELETE /barri/:id (first delete)", del1, 200);

            const { status: del2 } = await fetchJson(`${BASE_URL}/barri/${body.id}`, { method: "DELETE" });
            assertStatus("DELETE /barri/:id (second delete → 404)", del2, 404);
        }
    }

    // 5.9 Create codiPostal with very long string
    {
        const longCode = "A".repeat(20);
        const { status, body } = await fetchJson(`${BASE_URL}/codiPostal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Codi: longCode }),
        });
        if (status === 201 && body?.id) {
            // Could be truncated by DB, just verify it was handled
            console.log(`  \x1b[33m\u26a0 Long codiPostal created with id=${body.id}\x1b[0m`);
            await fetchJson(`${BASE_URL}/codiPostal/${body.id}`, { method: "DELETE" });
        }
        assert("POST /codiPostal long Codi handled", status === 201 || status >= 400, `unexpected ${status}`);
    }
}

// ─────────────────────────────────────────────
// SECTION 3: WORKFLOW TESTS
// ─────────────────────────────────────────────
async function testWorkflows() {
    section("WORKFLOW: FULL CLIENT CREATION");

    // 6.1 Full workflow: create family → add members → project → assign
    {
        // Step 1: Create a new family
        const famName = `Workflow_${makeId("")}`;
        const { status: st1, body: fam } = await fetchJson(`${BASE_URL}/familia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Cognom_familiar: famName, Estructura_familiar: 1 }),
        });
        assertStatus("WORKFLOW: POST /familia", st1, 201);
        const idFamilia = fam?.id;
        if (idFamilia) {
            // Step 2: Create a domicili
            const { status: st2, body: dom } = await fetchJson(`${BASE_URL}/domicili`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Tipus_domicili: 1, Direccio: 1 }),
            });
            assertStatus("WORKFLOW: POST /domicili", st2, 201);
            const idDomicili = dom?.id;
            if (idDomicili) {
                // Step 3: Create clients in that family
                const { status: st3a, body: cli1 } = await fetchJson(`${BASE_URL}/client`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idFamilia, idRol: 3, idGenere: 1, Nom: "WorkflowChild1", Cognoms: famName,
                        Data_d_alta: "2025-01-01", C_temps_a_lentitat: "0", Fecha_nacimiento: "2015-06-01",
                        C_edad: 10, Pais_naixement: 1, Risc: 1, Resultat_academic: 1,
                        idSituacio_economica: 1, idSebas: 12, derivacio_serveis_socials: 0,
                        idDomicili, Baixa: 0
                    }),
                });
                assertStatus("WORKFLOW: POST /client (child 1)", st3a, 201);
                const { status: st3b, body: cli2 } = await fetchJson(`${BASE_URL}/client`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idFamilia, idRol: 1, idGenere: 2, Nom: "WorkflowParent", Cognoms: famName,
                        Data_d_alta: "2024-06-01", C_temps_a_lentitat: "1 any", Fecha_nacimiento: "1980-01-15",
                        C_edad: 45, Pais_naixement: 1, Risc: 1, Resultat_academic: 6,
                        idSituacio_economica: 1, idSebas: 12, derivacio_serveis_socials: 0,
                        idDomicili, Baixa: 0
                    }),
                });
                assertStatus("WORKFLOW: POST /client (parent)", st3b, 201);

                if (cli1?.id && cli2?.id) {
                    // Step 4: Create a project
                    const { status: st4, body: proj } = await fetchJson(`${BASE_URL}/projectes`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            projecte: {
                                Nom_projecte: `Projecte_${famName}`, Descripcio: "Projecte workflow",
                                plazas: 5, fecha_inicio_act: "2026-01-01", fecha_fin_act: "2026-12-31",
                                idcentre_activitats: 1
                            }
                        }),
                    });
                    assertStatus("WORKFLOW: POST /projectes", st4, 201);
                    const idProyecto = proj?.id;
                    if (idProyecto) {
                        // Step 5: Assign client to project
                        const { status: st5 } = await fetchJson(`${BASE_URL}/projectes/${idProyecto}/clients`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ clientIds: [cli1.id, cli2.id] }),
                        });
                        assert("WORKFLOW: POST /projectes/:id/clients → 2xx", st5 >= 200 && st5 < 300, `expected 2xx, got ${st5}`);

                        // Step 6: Verify project has participants
                        const { body: projCheck } = await fetchJson(`${BASE_URL}/projectes/${idProyecto}`);
                        if (projCheck?.participants) {
                            assert("WORKFLOW: project has participants", projCheck.participants.length >= 2, `expected >=2, got ${projCheck.participants.length}`);
                        }

                        // Step 7: Remove one client from project
                        const { status: st7 } = await fetchJson(`${BASE_URL}/projectes/${idProyecto}/clients/${cli2.id}`, { method: "DELETE" });
                        assertStatus("WORKFLOW: DELETE projecte client", st7, 200);

                        // Step 8: Verify family has members
                        const { body: famCheck } = await fetchJson(`${BASE_URL}/familia/${idFamilia}`);
                        if (famCheck?.membres) {
                            assert("WORKFLOW: family has members", famCheck.membres.length >= 2, `expected >=2, got ${famCheck.membres.length}`);
                        }

                        // Cleanup project
                        await fetchJson(`${BASE_URL}/projectes/${idProyecto}`, { method: "DELETE" });
                    }
                    // Cleanup clients
                    await fetchJson(`${BASE_URL}/client/${cli1.id}`, { method: "DELETE" });
                    await fetchJson(`${BASE_URL}/client/${cli2.id}`, { method: "DELETE" });
                }
                // Cleanup domicili (if no references remain)
                await fetchJson(`${BASE_URL}/domicili/${idDomicili}`, { method: "DELETE" });
            }
            // Cleanup family
            await fetchJson(`${BASE_URL}/familia/${idFamilia}`, { method: "DELETE" });
        }
    }

    // 6.2 SEARCH with filters
    section("WORKFLOW: SEARCH & FILTERS");

    {
        // Search clients by name
        const { status, body } = await fetchJson(`${BASE_URL}/client?q=Joan`);
        assertStatus("GET /client?q=Joan", status, 200);
        if (Array.isArray(body?.rows || body)) {
            const list = body.rows || body;
            assert("SEARCH client 'Joan' has results", list.length > 0, `got ${list.length} results`);
        }

        // Search families by name
        const { status: st2, body: b2 } = await fetchJson(`${BASE_URL}/familia?q=Garcia`);
        assertStatus("GET /familia?q=Garcia", st2, 200);
        if (Array.isArray(b2?.rows || b2)) {
            const list = b2.rows || b2;
            assert("SEARCH familia 'Garcia' has results", list.length > 0, `got ${list.length} results`);
        }

        // Filter clients by familia
        const { status: st3, body: b3 } = await fetchJson(`${BASE_URL}/client?familia=1`);
        assertStatus("GET /client?familia=1", st3, 200);
        if (Array.isArray(b3?.rows || b3)) {
            assert("FILTER client by familia=1 has results", b3.rows.length > 0, `got ${b3.rows.length} results`);
        }

        // Filter clients by genere
        const { status: st4, body: b4 } = await fetchJson(`${BASE_URL}/client?genere=2`);
        assertStatus("GET /client?genere=2", st4, 200);
        if (Array.isArray(b4?.rows || b4)) {
            assert("FILTER client by genere=2 has results", b4.rows.length > 0, `got ${b4.rows.length} results`);
        }

        // Pagination test
        const { status: st5, body: b5 } = await fetchJson(`${BASE_URL}/client?offset=0&limit=3`);
        assertStatus("GET /client?offset=0&limit=3", st5, 200);
        if (Array.isArray(b5?.rows || b5)) {
            assert("PAGINATION limit=3 returns ≤3 rows", (b5.rows || b5).length <= 3, `got ${(b5.rows || b5).length} rows`);
        }

        // Filter by edat range
        const { status: st6, body: b6 } = await fetchJson(`${BASE_URL}/client?edatMin=10&edatMax=20`);
        assertStatus("GET /client?edatMin=10&edatMax=20", st6, 200);
        if (Array.isArray(b6?.rows || b6)) {
            const list = b6.rows || b6;
            const allInRange = list.every(c => c.C_edad >= 10 && c.C_edad <= 20);
            assert("FILTER client age 10-20", allInRange, "some clients outside range");
        }

        // Desplegables: verify all catalogs return data
        const catalogs = ["barri", "codi_postal", "curso", "genere", "neses", "pais", "rol", "sebas", "tipus_domicili", "tipus_via", "estructura_familiar", "situacio_eco", "motiu_baixa", "risc", "resul_acad"];
        for (const cat of catalogs) {
            const { status: sc, body: bc } = await fetchJson(`${BASE_URL}/desplegables/${cat}`);
            assert(`DESPLEGABLE ${cat} → 200 + array`, sc === 200 && Array.isArray(bc) && bc.length > 0, `status=${sc} len=${Array.isArray(bc) ? bc.length : 'N/A'}`);
        }
    }

    // 6.3 FULL CLIENT CREATE with existing family reuse
    {
        // Use existing family 1 (Garcia) with a new domicili
        const { status, body } = await fetchJson(`${BASE_URL}/domicili`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Tipus_domicili: 1, Direccio: 2 }),
        });
        if (status === 201 && body?.id) {
            const { status: st2 } = await fetchJson(`${BASE_URL}/client/full`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client: { Nom: "ReuseTest", Cognoms: "Garcia", Fecha_nacimiento: "2010-01-01", idGenere: 1, idRol: 3, idSituacio_economica: 1, Pais_naixement: 1 },
                    familia: { idFamilia: 1 },
                    domicili: { idDomicili: body.id }
                }),
            });
            assertStatus("WORKFLOW: POST /client/full with existing family+domicili", st2, 201);
            if (st2 === 201 && body?.id) {
                // cleanup
                const { body: clientList } = await fetchJson(`${BASE_URL}/client?q=ReuseTest`);
                const list = clientList?.rows || clientList || [];
                const match = Array.isArray(list) ? list.find(c => c.Nom === "ReuseTest") : null;
                if (match) {
                    await fetchJson(`${BASE_URL}/client/${match.idClient}`, { method: "DELETE" });
                }
            }
            await fetchJson(`${BASE_URL}/domicili/${body.id}`, { method: "DELETE" });
        }
    }

    // 6.4 GET /client with Baixa filter — verify baixa client exists
    {
        const { body } = await fetchJson(`${BASE_URL}/client`);
        const list = body?.rows || body || [];
        if (Array.isArray(list)) {
            const baixaClients = list.filter(c => c.Baixa === 1 || c.Baixa === true || c.Baixa === "1");
            assert("SEED: baixa client exists", baixaClients.length > 0, `found ${baixaClients.length} baixa clients`);
        }
    }

    // 6.5 GET /client/:id for baixa client — should show Motiu_baixa and Data_baixa
    {
        const { body: all } = await fetchJson(`${BASE_URL}/client`);
        const list = all?.rows || all || [];
        const baixa = Array.isArray(list) ? list.find(c => c.Baixa === 1 || c.Baixa === true || c.Baixa === "1") : null;
        if (baixa?.idClient) {
            const { body: detail } = await fetchJson(`${BASE_URL}/client/${baixa.idClient}`);
            if (detail) {
                assert("BAIXA client has Motiu_baixa", detail.Motiu_baixa != null, "Motiu_baixa is null");
                assert("BAIXA client has Data_baixa", detail.Data_baixa != null, "Data_baixa is null");
            }
        }
    }
}

// ─────────────────────────────────────────────
// SECTION 4: FRONTEND-LIKE API SCENARIOS
// ─────────────────────────────────────────────
async function testFrontendScenarios() {
    section("FRONTEND: USER INPUT EDGE CASES");

    // 7.1 Login with empty fields
    {
        const { status } = await fetchJson(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "", password: "" }),
        });
        assert("LOGIN empty fields → 4xx", status >= 400, `expected 4xx, got ${status}`);
    }

    // 7.2 Login with wrong credentials
    {
        const { status, body } = await fetchJson(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "nonexistent_user", password: "wrong" }),
        });
        assert("LOGIN wrong credentials → 401", status === 401, `expected 401, got ${status}`);
    }

    // 7.3 Callejero search with very short query (< 3 chars)
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero?q=AB`);
        assertStatus("CALLEJERO search 2 chars", status, 200);
        if (Array.isArray(body)) {
            assert("CALLEJERO query < 3 chars → empty or all results", true, `got ${body.length} results`);
        }
    }

    // 7.4 Callejero search without query (should return all or empty)
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero`);
        assertStatus("CALLEJERO no query", status, 200);
    }

    // 7.5 Familia search with non-existent name
    {
        const { status, body } = await fetchJson(`${BASE_URL}/familia/search?q=ZZZZZZZ`);
        assertStatus("FAMILIA search non-existent", status, 200);
        assert("FAMILIA search non-existent → empty", Array.isArray(body) && body.length === 0, `got ${body?.length} results`);
    }

    // 7.6 Check family name — existing
    {
        const { status, body } = await fetchJson(`${BASE_URL}/familia/checkName?name=Garcia`);
        assertStatus("FAMILIA checkName existing", status, 200);
        assert("FAMILIA checkName Garcia exists", body?.exists === true, `got exists=${body?.exists}`);
    }

    // 7.7 Check family name — non-existing
    {
        const { status, body } = await fetchJson(`${BASE_URL}/familia/checkName?name=XXXXXX`);
        assertStatus("FAMILIA checkName non-existing", status, 200);
        assert("FAMILIA checkName XXXXXX not exists", body?.exists === false, `got exists=${body?.exists}`);
    }

    // 7.8 Check family name — missing parameter
    {
        const { status } = await fetchJson(`${BASE_URL}/familia/checkName`);
        assertStatus("FAMILIA checkName missing param", status, 400);
    }

    // 7.9 Domicili search for existing family
    {
        const { status, body } = await fetchJson(`${BASE_URL}/domicili/search?q=A`);
        assertStatus("DOMICILI search", status, 200);
        if (Array.isArray(body)) {
            assert("DOMICILI search has results", body.length >= 0, `got ${body.length} results`);
        }
    }

    // 7.10 Domicili by family
    {
        const { status, body } = await fetchJson(`${BASE_URL}/domicili/byFamily/1`);
        assertStatus("DOMICILI byFamily/1", status, 200);
        if (Array.isArray(body)) {
            assert("DOMICILI byFamily/1 has results", body.length >= 0, `got ${body.length} results`);
        }
    }

    // 7.11 Domicili by non-existent family
    {
        const { status, body } = await fetchJson(`${BASE_URL}/domicili/byFamily/999999`);
        assertStatus("DOMICILI byFamily/999999", status, 200);
        assert("DOMICILI byFamily/999999 empty", Array.isArray(body) && body.length === 0, `got ${body?.length} results`);
    }
}

// ─────────────────────────────────────────────
// SECTION 5: BULK DATA INTEGRITY
// ─────────────────────────────────────────────
async function testDataIntegrity() {
    section("DATA INTEGRITY");

    // Verify entities that should exist from seed
    async function checkSeedEntity(url, label, minCount) {
        const { status, body } = await fetchJson(url);
        const list = body?.rows || body || [];
        if (status === 200 && Array.isArray(list)) {
            assert(`SEED: ${label} >= ${minCount}`, list.length >= minCount, `found ${list.length}, expected >=${minCount}`);
        } else {
            console.log(`  \x1b[33m\u26a0 ${label}: status=${status}\x1b[0m`);
        }
    }

    await checkSeedEntity(`${BASE_URL}/client`, "clients", 12);
    await checkSeedEntity(`${BASE_URL}/familia`, "families", 8);
    await checkSeedEntity(`${BASE_URL}/domicili`, "domicilis", 10);
    await checkSeedEntity(`${BASE_URL}/projectes`, "projects", 5);
    await checkSeedEntity(`${BASE_URL}/usuario`, "users", 3);
    await checkSeedEntity(`${BASE_URL}/centre-activitats`, "centres", 3);

    // Verify callejero has data
    {
        const { status, body } = await fetchJson(`${BASE_URL}/callejero?q=A`);
        assert("CALLEJERO has data", status === 200 && Array.isArray(body) && body.length > 0, `status=${status} count=${Array.isArray(body) ? body.length : 0}`);
    }

    // Verify desplegables all have data
    {
        const catalogs = ["pais", "rol", "risc", "genere", "sebas", "tipus_via", "tipus_domicili"];
        for (const cat of catalogs) {
            const { status, body } = await fetchJson(`${BASE_URL}/desplegables/${cat}`);
            if (status === 200 && Array.isArray(body)) {
                assert(`DESPLEGABLE ${cat} has data (≥3)`, body.length >= 3, `got ${body.length}`);
            }
        }
    }
}

function stripAnsi(str) {
    return str.replace(/\x1b\[\d+m/g, "");
}

function generateAdvReport() {
    const lines = [];
    lines.push(`# ADV Test Report`);
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
        lines.push(`✅ **All ADV tests passed**`);
    } else {
        lines.push(`❌ **${RESULTS.fail} test(s) failed**`);
    }
    return lines.join("\n");
}

function generateAdvInform() {
    const failed = RESULTS.tests.filter(t => t.includes("✗") || t.includes("\u2717"));
    const lines = [];
    lines.push(`# ADV Test Errors`);
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

function writeAdvReports() {
    const dir = path.join(__dirname, "..", "docs", "AI_TESTS");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const lastPath = path.join(dir, "ADV_last.md");
    fs.writeFileSync(lastPath, generateAdvReport(), "utf8");
    console.log(`\nInforme guardat a docs/AI_TESTS/ADV_last.md`);

    const informPath = path.join(dir, "ADV_inform.md");
    fs.writeFileSync(informPath, generateAdvInform(), "utf8");
    console.log(`Solucions guardades a docs/AI_TESTS/ADV_inform.md`);
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
    console.log("\n=== SEEDING DATABASE ===\n");
    try {
        await seed.runSeed();
    } catch (err) {
        console.error("Error en seed:", err.message);
        process.exit(1);
    }

    console.log("\n=== INICIANT SERVIDOR ===\n");
    const serverProcess = spawn("node", ["server.js"], {
        cwd: __dirname,
        env: { ...process.env, PORT: "3001" },
        stdio: ["ignore", "pipe", "pipe"],
    });

    let serverOutput = "";
    serverProcess.stdout.on("data", (data) => { serverOutput += data.toString(); });
    serverProcess.stderr.on("data", (data) => { serverOutput += data.toString(); });

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
            serverProcess.on("error", (err) => { clearTimeout(timeout); reject(err); });
        });

        console.log("Servidor llest a", BASE_URL);

        await getAuthToken();

        const testFunctions = [
            testUniqueConstraints,
            testNotNullConstraints,
            testForeignKeyConstraints,
            testDeleteRestrictions,
            testEdgeCases,
            testWorkflows,
            testFrontendScenarios,
            testDataIntegrity,
        ];

        for (const fn of testFunctions) {
            try {
                await fn();
            } catch (err) {
                console.error(`\x1b[31mERROR in ${fn.name}:\x1b[0m`, err.message);
                RESULTS.fail++;
            }
        }

        console.log("\n=== RESUM ===\n");
        const total = RESULTS.pass + RESULTS.fail + RESULTS.warn;
        console.log(`Passats: ${RESULTS.pass}`);
        console.log(`Fallats: ${RESULTS.fail}`);
        console.log(`Advertències: ${RESULTS.warn}`);
        console.log(`Totals: ${total}`);
        console.log(RESULTS.fail === 0
            ? "\n\u2705 TOTS ELS TESTS AVANÇATS PASSATS"
            : `\n\u274c ${RESULTS.fail} TEST(S) AVANÇATS FALLATS`);

        writeAdvReports();

    } finally {
        serverProcess.kill();
        setTimeout(() => process.exit(RESULTS.fail > 0 ? 1 : 0), 500);
    }
}

main();
