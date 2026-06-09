
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
];

const RESULTS = { pass: 0, fail: 0, tests: [] };

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

async function fetchJson(url, options) {
    const res = await fetch(url, options);
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

async function testEndpoint(path, readOnly) {
    const fullPath = `${BASE_URL}${path}`;
    const name = path;

    let id = null;

    // GET all
    {
        const { status, body } = await fetchJson(fullPath);
        assert(
            `GET ${name} → ${status}`,
            status === 200 && Array.isArray(body),
            `expected 200 + array, got ${status}`
        );
        if (Array.isArray(body) && body.length > 0) {
            id = body[0].idClient || body[0].idPais || body[0].idEstructura_familiar
                || body[0].idMotiu_baixa || body[0].idNecessitat_especial
                || body[0].idResultat_academic || body[0].idRisc || body[0].idRol
                || body[0].idSebas || body[0].idSituacio_economica
                || body[0].idTipus_domicili || body[0].idCurs_actual
                || body[0].idProyecto || body[0].idUsuario_APP
                || body[0].idDomicili || body[0].idFamilia || body[0].idClient
                || Object.values(body[0]).find(v => typeof v === "number") || 1;
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

    if (!readOnly) {
        // POST create
        const payload = buildPayload(path);
        if (payload) {
            const { status, body } = await fetchJson(fullPath, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            assert(
                `POST ${name} → ${status}`,
                status === 201 && body && body.id,
                `expected 201 + id, got ${status} ${JSON.stringify(body)}`
            );
            id = body?.id;

            // PUT update
            if (id) {
                const updatePayload = buildUpdatePayload(path);
                const { status: putStatus } = await fetchJson(`${fullPath}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatePayload),
                });
                assert(
                    `PUT ${name}/${id} → ${putStatus}`,
                    putStatus === 200,
                    `expected 200, got ${putStatus}`
                );

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
}

function buildPayload(path) {
    const payloads = {
        "/neses": { Nom_necessitat: "Necessitat Test" },
        "/curso": { Nom: "Curs Test" },
        "/projectes": {
            projecte: {
                Nom_projecte: "Projecte Test 2",
                Descripcio: "Descripcio test 2",
                responsable: 1,
            }
        },
        "/usuario": { Rol_usuario: "Test User" },
        "/domicili": { Tipus_domicili: 1, Direccio: 1 },
        "/familia": { Cognom_familiar: "Test", idDomicili: 1, Estructura_familiar: 1 },
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
    return payloads[path] || null;
}

function buildUpdatePayload(path) {
    const base = buildPayload(path);
    if (!base) return null;
    if (path === "/client") return { ...base, Nom: "Maria Actualitzada" };
    if (path === "/projectes") return {
        ...base.projecte,
        Nom_projecte: "Projecte Test 2 Actualitzat",
    };
    if (path === "/domicili") return { ...base };
    if (path === "/familia") return { ...base };
    if (path === "/neses") return { ...base };
    if (path === "/curso") return { ...base };
    if (path === "/usuario") return { ...base };
    return base;
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
    lines.push(`- **Total:** ${RESULTS.pass + RESULTS.fail}`);
    lines.push(``);
    lines.push(`## Results`);
    lines.push(``);
    lines.push("```");
    for (const t of RESULTS.tests) {
        lines.push(t);
    }
    lines.push("```");
    lines.push(``);
    if (RESULTS.fail === 0) {
        lines.push(`✅ **All tests passed**`);
    } else {
        lines.push(`❌ **${RESULTS.fail} test(s) failed**`);
    }
    return lines.join("\n");
}

function getNextReportNumber() {
    const docsDir = path.join(__dirname, "..", "docs");
    if (!fs.existsSync(docsDir)) return 1;
    const files = fs.readdirSync(docsDir);
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
        console.log("\n=== EXECUTANT TESTS ===\n");

        for (const ep of ENDPOINTS) {
            console.log(`\n--- ${ep.path} ---`);
            await testEndpoint(ep.path, ep.readOnly);
        }

        console.log("\n=== RESUM ===\n");
        console.log(`Passats: ${RESULTS.pass}`);
        console.log(`Fallats: ${RESULTS.fail}`);
        console.log(`Total:   ${RESULTS.pass + RESULTS.fail}`);
        console.log(RESULTS.fail === 0 ? "\n✅ TOTS ELS TESTS PASSATS" : `\n❌ ${RESULTS.fail} TEST(S) FALLATS`);

        const report = generateReport();
        const num = getNextReportNumber();
        const filename = `AI_test_${String(num).padStart(3, "0")}.md`;
        const reportPath = path.join(__dirname, "..", "docs", filename);
        fs.writeFileSync(reportPath, report, "utf8");
        console.log(`\nInforme guardat a docs/${filename}`);

    } finally {
        serverProcess.kill();
        setTimeout(() => process.exit(RESULTS.fail > 0 ? 1 : 0), 500);
    }
}

main();
