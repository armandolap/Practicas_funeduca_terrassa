const fs = require("fs");
const path = require("path");
const { createPool } = require("../config/database");

const pool = createPool();

async function runSQLFile(conn, filePath) {
    const sql = fs.readFileSync(filePath, "utf8");
    const statements = sql
        .replace(/^use\s+`?\w+`?\s*;/gim, "")
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (const stmt of statements) {
        try {
            await conn.query(stmt);
        } catch (err) {
            if (err.errno !== 1061 && err.errno !== 1050 && err.errno !== 1060 && err.errno !== 1062) {
                console.warn(`  SQL advertencia: ${err.message.slice(0, 80)}`);
            }
        }
    }
}

async function insertTestData(conn) {
    // Multiple direccios using different callejero entries
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (1, '10', '1', 'A')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (2, '5', '2', 'B')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (5, '3', NULL, NULL)`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (8, '7', '4', 'C')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (9, '1', NULL, NULL)`);

    // Multiple domicilis
    await conn.query(`INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (1, 1)`); // Lloguer → ABAT MARCET 10 1A
    await conn.query(`INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (2, 2)`); // Hipoteca → ABAT MARCET 5 2B
    await conn.query(`INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (1, 3)`); // Lloguer → ABLA 3
    await conn.query(`INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (1, 4)`); // Lloguer → ADRA 7 4C
    await conn.query(`INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (7, 5)`); // Altres → ÀFRICA 1

    // Multiple familias
    await conn.query(`INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES ('Garcia', 1)`);
    await conn.query(`INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES ('Martínez', 2)`);
    await conn.query(`INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES ('López', 1)`);
    await conn.query(`INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES ('Rodríguez', 3)`);
    await conn.query(`INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES ('Ferrer', 6)`);

    // Usuario_app
    await conn.query(`INSERT INTO Usuario_APP (idNivel_acceso, Nom, Cognoms, email, Telefon, password) VALUES (1, 'Usuari', 'Test', 'test@test.com', '600000000', '$2b$10$LKZOF.JsFT1DYYgWQx9j9OG1WlSlLbBUSxVHkOuNtDuMrdSCbZZhC')`);

    // Centre activitats
    await conn.query(`INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES ('Centre Test', 1)`);

    // Projectes
    await conn.query(`INSERT INTO Proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats) VALUES ('Projecte Test', 'Descripcio de prova', 10, 0, CURDATE(), CURDATE(), 1)`);

    // Clients
    // Garcia family (id=1) — 2 members at same domicile (id=1)
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (1, 3, 1, 'Joan', 'Garcia Lopez', NULL, NULL, CURDATE(), '1 any', '2010-05-15', 16, 1, 1, 1, 1, 1, 3, 0, 1, 0)`);
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (1, 3, 2, 'Maria', 'Garcia Lopez', '600111222', 'maria@mail.com', CURDATE(), '6 mesos', '2015-08-20', 11, 1, 2, 2, 1, 1, 3, 0, 1, 0)`);

    // Martínez family (id=2) — 2 members at different domiciles (2, 3)
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (2, 3, 1, 'Carlos', 'Martínez Ruiz', '600222333', NULL, CURDATE(), '2 anys', '2008-03-10', 18, 1, 3, 1, 2, 1, 3, 0, 2, 0)`);
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (2, 3, 2, 'Ana', 'Martínez Sánchez', '600333444', 'ana@mail.com', CURDATE(), '1 any', '2012-11-25', 14, 2, 4, 3, 3, 12, 1, 1, 3, 0)`);

    // López family (id=3) — 1 member
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (3, 3, 1, 'Pedro', 'López García', '600444555', NULL, CURDATE(), '3 anys', '2005-07-01', 21, 1, 1, 6, 3, 12, 3, 0, 4, 0)`);

    // Rodríguez family (id=4) — 1 member
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (4, 3, 2, 'Laura', 'Rodríguez Torres', '600555666', 'laura@mail.com', CURDATE(), '6 mesos', '2018-01-15', 8, 1, 1, 2, 4, 12, 3, 0, 5, 0)`);

    // Ferrer family (id=5) — 1 member
    await conn.query(`INSERT INTO Client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa)
        VALUES (5, 3, 1, 'Marc', 'Ferrer Costa', '600666777', 'marc@mail.com', CURDATE(), '1 any', '2016-09-05', 10, 1, 2, 5, 2, 12, 2, 0, 1, 0)`);

    console.log("Seed completat correctament");
}

const ORDERED_TABLES = [
    "Responsables",
    "proyectos_has_client",
    "necessitats_especials_has_client",
    "nacionalitat",
    "client",
    "proyectos",
    "usuario_app",
    "Nivel_acceso",
    "familia",
    "domicili",
    "centre_activitats",
    "direccio",
    "callejero",
    "tipus_domicili",
    "tipus_via",
    "barri",
    "codi_postal",
    "pais",
    "rol",
    "risc",
    "resultat_academic",
    "motiu_baixa",
    "situacio_economica",
    "sebas",
    "curs_actual",
    "genere",
    "estructura_familiar",
    "necessitats_especials"
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

        // Load base schema
        const basePath = path.join(__dirname, "..", "sql", "Base_datos.sql");
        await runSQLFile(connection, basePath);

        // Load static + callejero data
        const dataPath = path.join(__dirname, "..", "sql", "inserts_tablas_estaticas.sql");
        await runSQLFile(connection, dataPath);

        // Insert test data
        await insertTestData(connection);

        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    } catch (error) {
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { runSeed, insertTestData };

if (require.main === module) {
    runSeed()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Error en seed:", err.message);
            process.exit(1);
        });
}
