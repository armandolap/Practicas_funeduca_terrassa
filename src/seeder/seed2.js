const fs = require("fs");
const path = require("path");

const dotenvPath = path.resolve(__dirname, "..", "..", ".env");
if (require.main === module && fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath });
}

const { createPool } = require("../config/database");
const { runSQLFile } = require("../helpers/sqlRunner");
const pool = createPool();

const ORDERED_TABLES = [
    "Responsables", "proyectos_has_client", "necessitats_especials_has_client",
    "nacionalitat", "client", "proyectos", "usuario_app", "Nivel_acceso",
    "familia", "domicili", "centre_activitats", "direccio", "callejero",
    "tipus_domicili", "tipus_via", "barri", "codi_postal", "pais", "rol",
    "risc", "resultat_academic", "motiu_baixa", "situacio_economica",
    "sebas", "curs_actual", "genere", "estructura_familiar",
    "necessitats_especials", "curs_lectiu"
];

// ---------- helpers ----------
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(n, arr) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
}
function dateStr(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function randomDate(y1, y2) {
    const y = randInt(y1, y2);
    const m = randInt(1, 12);
    const d = randInt(1, 28);
    return dateStr(y, m, d);
}

// ---------- source data ----------
const FIRST_NAMES_M = [
    "Alex", "Marc", "Pol", "Jan", "Pau", "Arnau", "Eric", "Nil", "Joel", "David",
    "Carlos", "Jordi", "Sergi", "Adrià", "Roger", "Hugo", "Gerard", "Andreu", "Martí", "Guillem",
    "Marcel", "Nil", "Biel", "Ferran", "Lluís", "Ramon", "Josep", "Antoni", "Francesc", "Albert",
    "Xavier", "Daniel", "Miquel", "Ivan", "Javier", "Ángel", "Manuel", "Pedro", "Rafael", "Víctor"
];
const FIRST_NAMES_F = [
    "Maria", "Marta", "Laia", "Paula", "Júlia", "Carla", "Anna", "Núria", "Clàudia", "Aina",
    "Sara", "Elena", "Alba", "Cristina", "Laura", "Marina", "Irene", "Judit", "Nora", "Elisabet",
    "Sílvia", "Montse", "Rosa", "Mònica", "Eva", "Dolors", "Mireia", "Carme", "Teresa", "Neus",
    "Raquel", "Sandra", "Patrícia", "Ruth", "Noemí", "Natalia", "Andrea", "Lidia", "Helena", "Pilar"
];
const FIRST_NAMES_NB = ["Àlex", "Cris", "Eli", "Dani", "Mika", "Sam"];

const SURNAME_BASES = [
    "Garcia", "Martínez", "López", "Rodríguez", "Fernández", "González", "Sánchez", "Pérez",
    "Martín", "Gómez", "Ruiz", "Díaz", "Hernández", "Torres", "Aguilar", "Navarro", "Vidal",
    "Molina", "Serrano", "Ramos"
];

const PROJECT_PREFIXES = [
    "Taller", "Extraescolar", "Casal", "Colònies", "Suport", "Reforç", "Integració",
    "Acompanyament", "Esportiu", "Artístic", "Musical", "Lúdic", "Formació", "Inserció",
    "Convivència", "Mediació", "Lectura", "Matemàtiques", "Ciències", "Tecnologia",
    "Idiomes", "Teatre", "Dansa", "Cuina", "Hort", "Reciclatge", "Voluntariat",
    "Tutoria", "Orientació", "Prevenció"
];
const PROJECT_SUFFIXES = [
    "Primària", "Secundària", "Infantil", "Famílies", "Joves", "Infants",
    "Adolescents", "Comunitari", "Matí", "Tarda", "Cap de setmana", "Estiu"
];

function ageToCurs(age) {
    if (age <= 2 || age > 25) return 26;
    if (age <= 17) return age - 2; // I3(3)→1 … 4t ESO(15)→13
    if (age <= 18) return 15;      // 2n Batx
    if (age <= 19) return 17;      // 2n CFGM
    if (age <= 20) return 19;      // 2n CFGS
    if (age <= 23) return age - 3; // 1r–4t Grau (20–23)
    return 26; // No aplica
}
const CENTRE_NAMES = [
    "Centre Cívic", "Casal de Joves", "Centre Obert", "Punt d'Informació",
    "Espai Familiar", "Ludoteca", "Centre Cultural"
];
const CENTRE_SUFFIXES = ["Nord", "Sud", "Est", "Oest", "Central", "Nou"];

const ROLES = [1, 1, 2, 2, 3, 3, 3, 4, 5, 6]; // weighted: more fill/a (3), then mare (1), pare (2)

// ---------- main seed ----------
async function runSeed() {
    const conn = await pool.getConnection();
    try {
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");

        // Clear all data
        for (const table of ORDERED_TABLES) {
            await conn.query(`DELETE FROM \`${table}\``);
        }
        for (const table of ORDERED_TABLES) {
            await conn.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
        }

        // Re-run schema + static data
        await runSQLFile(conn, path.join(__dirname, "..", "sql", "Base_datos.sql"));
        await runSQLFile(conn, path.join(__dirname, "..", "sql", "inserts_tablas_estaticas.sql"));
        await runSQLFile(conn, path.join(__dirname, "..", "sql", "2026-06-22_add_curs_lectiu.sql"));

        // ==============================
        // 1. DIRECCIONS (40)
        // ==============================
        const direccioData = [];
        for (let i = 0; i < 40; i++) {
            direccioData.push([
                randInt(1, 200),
                String(randInt(1, 120)),
                Math.random() < 0.6 ? String(randInt(1, 9)) : null,
                Math.random() < 0.4 ? String(randInt(1, 5)) + "a" : null,
            ]);
        }
        await conn.query(
            "INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES ?",
            [direccioData]
        );
        const numDir = 40;

        // ==============================
        // 2. DOMICILIS (40)
        // ==============================
        const domData = [];
        for (let i = 0; i < 40; i++) {
            domData.push([randInt(1, 7), i + 1]);
        }
        await conn.query(
            "INSERT INTO domicili (Tipus_domicili, Direccio) VALUES ?",
            [domData]
        );
        const numDom = 40;

        // ==============================
        // 3. FAMILIES (80)
        // ==============================
        const famData = [];
        const famIds = [];
        let famIdx = 0;
        for (let g = 1; g <= 4; g++) {
            for (const base of SURNAME_BASES) {
                if (famIdx >= 80) break;
                const suffix = g === 1 ? "" : ` ${g}`;
                const name = base + suffix;
                const struct = randInt(1, 6);
                famData.push([name, struct]);
                famIds.push(famIdx + 1);
                famIdx++;
            }
            if (famIdx >= 80) break;
        }
        // Pad if needed - already 80 (20 bases × 4 groups)
        await conn.query(
            "INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ?",
            [famData.map(f => [f[0], f[1]])]
        );

        // ==============================
        // 4. CLIENTS (400)
        // ==============================
        const clientCols = [
            "idFamilia", "idRol", "idGenere", "Nom", "Cognoms", "Telefon",
            "Correu_electronic", "Data_d_alta", "C_temps_a_lentitat",
            "Fecha_nacimiento", "C_edad", "Pais_naixement", "Risc",
            "Resultat_academic", "idSituacio_economica", "idSebas",
            "idNecessitat_especial", "derivacio_serveis_socials", "idDomicili",
            "Baixa", "Curs_actual"
        ];
        const allClients = [];
        const genderRatio = [1, 1, 1, 2, 2, 2, 3]; // 3 M : 3 F : 1 NB

        for (let f = 0; f < 80; f++) {
            const famId = f + 1;
            const famSurname = famData[f][0];
            const domId = (f % numDom) + 1;
            const isSmall = f % 7 === 0; // occasionally smaller families

            // 2 parents (rol 1 or 2) + 2-3 children (rol 3) = 4-5 per family
            const numChildren = isSmall ? randInt(1, 2) : randInt(2, 4);
            const numParents = isSmall && Math.random() < 0.2 ? 1 : 2;

            const members = [];

            // Parents
            const parentRoles = [];
            if (numParents === 2) {
                parentRoles.push(1, 2); // mare + pare
            } else {
                parentRoles.push(Math.random() < 0.5 ? 1 : 2);
            }
            for (const rol of parentRoles) {
                const gender = rol === 1 ? 2 : 1; // mare→Femení, pare→Masculí
                const names = gender === 1 ? FIRST_NAMES_M : FIRST_NAMES_F;
                const name = pick(names);
                const birthY = randInt(1975, 2000);
                const age = new Date().getFullYear() - birthY;
                const alta = randomDate(2020, 2025);
                members.push([
                    famId, rol, gender, name, famSurname,
                    Math.random() < 0.7 ? `6${String(randInt(0, 9)).padStart(2, "0")}${String(randInt(100000, 999999))}` : null,
                    Math.random() < 0.5 ? `${name.toLowerCase()}${randInt(1, 999)}@mail.com` : null,
                    alta, `${randInt(1, 6)} anys`,
                    dateStr(birthY, randInt(1, 12), randInt(1, 28)),
                    age,
                    Math.random() < 0.85 ? 1 : randInt(2, 20),
                    Math.random() < 0.4 ? 1 : randInt(2, 4),
                    Math.random() < 0.5 ? randInt(1, 6) : null,
                    randInt(1, 5),
                    Math.random() < 0.2 ? randInt(1, 11) : 12,
                    Math.random() < 0.15 ? randInt(1, 4) : (Math.random() < 0.5 ? 3 : null),
                    Math.random() < 0.1 ? 1 : 0,
                    domId, 0, 26
                ]);
            }

            // Children
            for (let c = 0; c < numChildren; c++) {
                const gen = pick(genderRatio);
                const names = gen === 1 ? FIRST_NAMES_M : gen === 2 ? FIRST_NAMES_F : FIRST_NAMES_NB;
                const name = pick(names);
                const birthY = randInt(2006, 2024);
                const age = new Date().getFullYear() - birthY;
                const curs = ageToCurs(age);
                const alta = randomDate(2020, 2025);
                members.push([
                    famId, 3, gen, name, famSurname,
                    Math.random() < 0.5 ? `6${String(randInt(0, 9)).padStart(2, "0")}${String(randInt(100000, 999999))}` : null,
                    Math.random() < 0.4 ? `${name.toLowerCase()}${randInt(1, 999)}@mail.com` : null,
                    alta, `${randInt(1, 3)} anys`,
                    dateStr(birthY, randInt(1, 12), randInt(1, 28)),
                    age,
                    Math.random() < 0.8 ? 1 : randInt(2, 40),
                    randInt(1, 4),
                    randInt(1, 6),
                    randInt(1, 5),
                    Math.random() < 0.15 ? randInt(1, 11) : 12,
                    Math.random() < 0.2 ? randInt(1, 4) : (Math.random() < 0.4 ? 3 : null),
                    Math.random() < 0.1 ? 1 : 0,
                    domId, 0, curs
                ]);
            }

            allClients.push(...members);
        }

        // Insert clients in batches
        for (let i = 0; i < allClients.length; i += 50) {
            const batch = allClients.slice(i, i + 50);
            await conn.query(
                `INSERT INTO client (${clientCols.join(",")}) VALUES ?`,
                [batch]
            );
        }
        console.log(`  ${allClients.length} clients inserits`);

        // Mark ~5% as Baixa
        const allClientIds = Array.from({ length: allClients.length }, (_, i) => i + 1);
        const bajaIds = pickN(Math.floor(allClients.length * 0.05), allClientIds);
        for (const id of bajaIds) {
            await conn.query(
                "UPDATE client SET Baixa=1, Motiu_baixa=?, Data_baixa=? WHERE idClient=?",
                [randInt(1, 10), randomDate(2024, 2026), id]
            );
        }

        // ==============================
        // 5. NACIONALITATS (second nationality for ~10% of clients)
        // ==============================
        const nacClients = pickN(Math.floor(allClients.length * 0.1), allClientIds);
        for (const id of nacClients) {
            await conn.query(
                "INSERT INTO nacionalitat (idPais, idClient) VALUES (?, ?)",
                [randInt(2, 60), id]
            );
        }

        // ==============================
        // 6. NECESSITATS_ESPECIALS_HAS_CLIENT (~15%)
        // ==============================
        const neseClients = pickN(Math.floor(allClients.length * 0.15), allClientIds);
        for (const id of neseClients) {
            await conn.query(
                "INSERT INTO necessitats_especials_has_client (idNecessitat_especial, idClient) VALUES (?, ?)",
                [randInt(1, 4), id]
            );
        }

        // ==============================
        // 7. CENTRES D'ACTIVITATS (5)
        // ==============================
        for (let i = 0; i < 5; i++) {
            const cName = `${pick(CENTRE_NAMES)} ${pick(CENTRE_SUFFIXES)}`;
            await conn.query(
                "INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES (?, ?)",
                [cName, randInt(1, numDir)]
            );
        }

        // ==============================
        // 8. PROJECTES (50)
        // ==============================
        const projData = [];
        const years = [];
        for (let y = 2023; y <= 2032; y++) {
            for (let n = 1; n <= 5; n++) years.push(y);
        }
        for (let i = 0; i < 50; i++) {
            const year = years[i];
            const startM = randInt(1, 11);
            const startD = randInt(1, 28);
            const dur = randInt(30, 180);
            const start = new Date(year, startM - 1, startD);
            const end = new Date(start.getTime() + dur * 86400000);
            const nom = `${pick(PROJECT_PREFIXES)} ${pick(PROJECT_SUFFIXES)} ${i + 1}`;
            const centre = randInt(1, 5);
            const cursIdx = Math.min(year - 2020, 21); // 2023 → 21/22 = idx 3...
            const curs = Math.max(1, Math.min(cursIdx, 21));
            projData.push([
                nom,
                `Projecte de prova per a càrrega de dades (${year})`,
                randInt(10, 40),
                0,
                dateStr(start.getFullYear(), start.getMonth() + 1, start.getDate()),
                dateStr(end.getFullYear(), end.getMonth() + 1, end.getDate()),
                centre,
                curs
            ]);
        }
        await conn.query(
            "INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats, idCurs_lectiu) VALUES ?",
            [projData]
        );
        console.log("  50 projectes inserits");

        // ==============================
        // 9. PROJECTES_HAS_CLIENT (~8 clients per project = 400)
        // ==============================
        const phcSet = new Set();
        for (let p = 0; p < 50; p++) {
            const projId = p + 1;
            const numCli = randInt(3, 10);
            const chosen = pickN(numCli, allClientIds);
            for (const c of chosen) {
                const key = `${projId}_${c}`;
                if (!phcSet.has(key)) {
                    phcSet.add(key);
                }
            }
        }
        const phcEntries = [...phcSet].map(k => {
            const [p, c] = k.split("_").map(Number);
            return [p, c];
        });
        await conn.query(
            "INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES ?",
            [phcEntries]
        );
        console.log(`  ${phcEntries.length} assignacions client-projecte`);

        // Update inscritos count
        for (const projId of [...new Set(phcEntries.map(e => e[0]))]) {
            const count = phcEntries.filter(e => e[0] === projId).length;
            await conn.query("UPDATE proyectos SET inscritos = ? WHERE idProyecto = ?", [count, projId]);
        }

        // ==============================
        // 10. USUARIS APP (15)
        // ==============================
        const PWH = "$2b$10$b336vCzXwgbOQ8oxHiPJke0JCMtKZOHznhzIaYQ4AU45XLYpXQRR2";
        const users = [
            // 2 admins
            [1, "Admin", "Principal", "admin1", "admin1@test.com", "600000001"],
            [1, "Admin", "Secundari", "admin2", "admin2@test.com", "600000011"],
            // 3 responsables zona (level 2)
            [2, "Zona", "Nord", "zona_nord", "zona.nord@test.com", "600000002"],
            [2, "Zona", "Sud", "zona_sud", "zona.sud@test.com", "600000012"],
            [2, "Zona", "Est", "zona_est", "zona.est@test.com", "600000022"],
            // 3 responsables projectes (level 3)
            [3, "Projectes", "Infantil", "proj_inf", "proj.inf@test.com", "600000003"],
            [3, "Projectes", "Joves", "proj_joves", "proj.joves@test.com", "600000013"],
            [3, "Projectes", "Famílies", "proj_fam", "proj.fam@test.com", "600000023"],
            // 4 treballadors (level 4)
            [4, "Treballador", "Social", "treb_social", "treb.social@test.com", "600000004"],
            [4, "Treballador", "Educador", "treb_educ", "treb.educ@test.com", "600000014"],
            [4, "Treballador", "Psicòleg", "treb_psi", "treb.psi@test.com", "600000024"],
            [4, "Treballador", "Admin", "treb_admin", "treb.admin@test.com", "600000034"],
            // 3 visitants (level 5)
            [5, "Visitant", "Extern", "visit_ext", "visit.ext@test.com", "600000005"],
            [5, "Visitant", "Col·laborador", "visit_col", "visit.col@test.com", "600000015"],
            [5, "Visitant", "Voluntari", "visit_vol", "visit.vol@test.com", "600000025"],
        ];
        await conn.query(
            "INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, username, email, Telefon, password) VALUES ?",
            [users.map(u => [u[0], u[1], u[2], u[3], u[4], u[5], PWH])]
        );
        console.log("  15 usuaris inserits");

        // ==============================
        // 11. RESPONSABLES (assign users to projects)
        // ==============================
        // Admin1 (id=1) → zona on 10 projects
        // Admin2 (id=2) → zona on 10 projects
        // Users 3-5 (zona) → 5 projects each
        // Users 6-8 (proj) → 5 projects each
        // Users 9-12 (treb) → 3 projects each
        const respSet = new Set();
        const allUserIds = Array.from({ length: 15 }, (_, i) => i + 1);
        const allProjIds = Array.from({ length: 50 }, (_, i) => i + 1);

        // Admins as zona (tipus=1) on random projects
        for (const uid of [1, 2]) {
            for (const pid of pickN(10, allProjIds)) {
                respSet.add(`${pid}_${uid}_1`);
            }
        }
        // Zona users (3-5) as zona on random projects
        for (const uid of [3, 4, 5]) {
            for (const pid of pickN(8, allProjIds)) {
                respSet.add(`${pid}_${uid}_1`);
            }
        }
        // Project users (6-8) as projecte (tipus=2)
        for (const uid of [6, 7, 8]) {
            for (const pid of pickN(6, allProjIds)) {
                respSet.add(`${pid}_${uid}_2`);
            }
        }
        // Treballadors (9-12) as treballador (tipus=3)
        for (const uid of [9, 10, 11, 12]) {
            for (const pid of pickN(4, allProjIds)) {
                respSet.add(`${pid}_${uid}_3`);
            }
        }

        const respEntries = [...respSet].map(k => {
            const [p, u, t] = k.split("_").map(Number);
            return [p, u, t];
        });
        await conn.query(
            "INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP, tipus_responsable) VALUES ?",
            [respEntries]
        );
        console.log(`  ${respEntries.length} assignacions responsable-projecte`);

        await conn.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("Seed2 completat correctament");
        console.log(`  ${allClients.length} clients`);
        console.log("  80 families");
        console.log("  50 projectes (2023-2032)");
        console.log("  15 usuaris");

    } catch (error) {
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");
        throw error;
    } finally {
        conn.release();
    }
}

module.exports = { runSeed };

if (require.main === module) {
    runSeed()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Error en seed2:", err.message);
            process.exit(1);
        });
}
