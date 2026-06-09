const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

async function runSQLFile(filePath) {
    const sql = fs.readFileSync(filePath, "utf8");
    const statements = sql
        .replace(/^use\s+`?\w+`?\s*;/gim, "")
        .replace(/^DROP\s+SCHEMA.+?;/gim, "")
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (const stmt of statements) {
        try {
            await pool.query(stmt);
        } catch (err) {
            if (err.errno !== 1061 && err.errno !== 1050 && err.errno !== 1060 && err.errno !== 1062) {
                console.warn(`  SQL advertencia: ${err.message.slice(0, 80)}`);
            }
        }
    }
}

const ORDERED_TABLES = [
    "Persona_relacionada",
    "Proyectos_has_Usuarios APP",
    "Necessitats_especials_has_Client",
    "Nacionalitat",
    "Client_has_Domicili",
    "Client",
    "Familia",
    "Proyectos",
    "Domicili",
    "Centre_coordinacio",
    "direccio",
    "Tipus_domicili",
    "Pais",
    "Rol",
    "Risc",
    "Resultat_academic",
    "Motiu_baixa",
    "Situacio_economica",
    "Sebas",
    "Curs_actual",
    "Genere",
    "Estructura_familiar",
    "Necessitats_especials",
    "Usuario_APP",
    "tipus_via",
    "barri",
    "codi_postal"
];

async function runSeed() {
    const connection = await pool.getConnection();

    try {
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        for (const table of ORDERED_TABLES) {
            await connection.query(`DELETE FROM \`${table}\``);
        }

        for (const table of ORDERED_TABLES) {
            await connection.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
        }

        // Load callejero schema (creates tables if not exist)
        const schemaPath = path.join(__dirname, "..", "sql", "callejero_schema.sql");
        await runSQLFile(schemaPath);

        // Load static + callejero data
        const dataPath = path.join(__dirname, "..", "sql", "inserts_tablas_estaticas.sql");
        await runSQLFile(dataPath);

        // Test data (FKs assume IDs from static inserts)
        await connection.query(`
            INSERT INTO Centre_coordinacio (Nom_centre_coord, idDireccio)
            VALUES ('Centre Test', 1)
        `);

        await connection.query(`
            INSERT INTO Domicili (Tipus_domicili, Direccio)
            VALUES (1, 1)
        `);

        await connection.query(`
            INSERT INTO Familia (Cognom_familiar, idDomicili, Estructura_familiar)
            VALUES ('Garcia', 1, 1)
        `);

        await connection.query(`
            INSERT INTO Usuario_APP (Rol_usuario)
            VALUES ('Test')
        `);

        await connection.query(`
            INSERT INTO Proyectos (Nom_projecte, Descripcio, responsable, Centre_coordinacio, fecha_inicio, fecha_fin, plazas, inscritos, fecha_inicio_act, fecha_fin_act)
            VALUES ('Projecte Test', 'Descripcio de prova', 1, 1, CURDATE(), CURDATE(), 10, 0, CURDATE(), CURDATE())
        `);

        await connection.query(`
            INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, derivacio_serveis_socials)
            VALUES (1, 3, 1, 'Joan', 'Garcia Lopez', NULL, NULL, CURDATE(), '1 any', '2010-05-15', 16, 1, 1, 1, 1, 1, 0)
        `);

        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("Seed completat correctament");
    } catch (error) {
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { runSeed };

if (require.main === module) {
    runSeed()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Error en seed:", err.message);
            process.exit(1);
        });
}
