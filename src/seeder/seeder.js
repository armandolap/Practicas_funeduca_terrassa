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
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    // ── Direccions (more variety) ──
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (1, '10', '1', 'A')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (2, '5', '2', 'B')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (5, '3', NULL, NULL)`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (8, '7', '4', 'C')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (9, '1', NULL, NULL)`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (15, '22', '3', '2a')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (100, '45', NULL, NULL)`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (200, '8', '1', 'B')`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (50, '33', '5', NULL)`);
    await conn.query(`INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (300, '12', NULL, NULL)`);

    // ── Domicilis (more variety) ──
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (1, 1)`);  // Lloguer
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (2, 2)`);  // Hipoteca
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (1, 3)`);  // Lloguer
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (1, 4)`);  // Lloguer
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (7, 5)`);  // Altres
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (3, 6)`);  // Ocupacio
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (4, 7)`);  // Compartit
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (5, 8)`);  // Emergencia
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (2, 9)`);  // Hipoteca
    await conn.query(`INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (6, 10)`); // Recurs residencial

    // ── Families (more variety) ──
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Garcia', 1)`);      // biparental
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Martínez', 2)`);    // monoparental (pare)
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('López', 1)`);       // biparental
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Rodríguez', 3)`);   // monoparental (mare)
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Ferrer', 6)`);      // divorci amb custodia
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Prat', 4)`);        // tutor legal (extrafamiliar)
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Vila', 5)`);        // tutor legal (intrafamiliar)
    await conn.query(`INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES ('Casals', 1)`);      // biparental

    // ── Usuaris ──
    const PWH = '$2b$10$b336vCzXwgbOQ8oxHiPJke0JCMtKZOHznhzIaYQ4AU45XLYpXQRR2';
    await conn.query(`INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, email, Telefon, password) VALUES (1, 'Usuari', 'Test', 'test@test.com', '600000000', '${PWH}')`);
    await conn.query(`INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, email, Telefon, password) VALUES (1, 'Admin', 'Sistema', 'admin@test.com', '600000001', '${PWH}')`);
    await conn.query(`INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, email, Telefon, password) VALUES (2, 'Supervisor', 'CRM', 'supervisor@test.com', '600000002', '${PWH}')`);
    await conn.query(`INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, email, Telefon, password) VALUES (3, 'Visitant', 'Anònim', 'visitant@test.com', '600000003', '${PWH}')`);

    // ── Centres d'activitats ──
    await conn.query(`INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES ('Centre Test', 1)`);
    await conn.query(`INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES ('Centre Esportiu', 3)`);
    await conn.query(`INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES ('Centre Cultural', 5)`);

    // ── Projectes ──
    await conn.query(`INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats) VALUES ('Projecte Test', 'Descripcio de prova', 10, 0, CURDATE(), CURDATE(), 1)`);
    await conn.query(`INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats) VALUES ('Projecte Actiu', 'Projecte en curs', 20, 0, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1)`);
    await conn.query(`INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats) VALUES ('Projecte Futur', 'Projecte que comença aviat', 15, 0, DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 2)`);
    await conn.query(`INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats) VALUES ('Projecte Passat', 'Projecte ja finalitzat', 8, 0, DATE_SUB(CURDATE(), INTERVAL 90 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY), 3)`);
    await conn.query(`INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats) VALUES ('Projecte Complet', 'Projecte amb totes les places', 5, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1)`);

    // ── Clients (existing + expanded edge cases) ──
    // Family 1: Garcia (biparental) — 2 children
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (1, 3, 1, 'Joan', 'Garcia Lopez', NULL, NULL, CURDATE(), '1 any', '2010-05-15', 16, 1, 1, 1, 1, 1, 3, 0, 1, 0, 10)`);
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (1, 3, 2, 'Maria', 'Garcia Lopez', '600111222', 'maria@mail.com', CURDATE(), '6 mesos', '2015-08-20', 11, 1, 2, 2, 1, 1, 3, 0, 1, 0, 5)`);
    // Parents of family 1
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (1, 1, 1, 'Pere', 'Garcia Martínez', '600111333', 'pere@mail.com', CURDATE(), '3 anys', '1980-03-10', 46, 1, 1, 6, 2, 12, NULL, 0, 1, 0, 26)`);
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (1, 2, 2, 'Anna', 'Garcia Martínez', '600111444', 'anna@mail.com', CURDATE(), '3 anys', '1982-07-22', 44, 1, 1, 6, 3, 12, NULL, 0, 1, 0, 26)`);

    // Family 2: Martínez (monoparental pare) — 2 children
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (2, 3, 1, 'Carlos', 'Martínez Ruiz', '600222333', NULL, CURDATE(), '2 anys', '2008-03-10', 18, 1, 3, 1, 2, 1, 3, 0, 2, 0, 20)`);
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (2, 3, 2, 'Ana', 'Martínez Sánchez', '600333444', 'ana@mail.com', CURDATE(), '1 any', '2012-11-25', 14, 2, 4, 3, 3, 12, 1, 1, 3, 0, 9)`);

    // Family 3: López (biparental) — 1 child
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (3, 3, 1, 'Pedro', 'López García', '600444555', NULL, CURDATE(), '3 anys', '2005-07-01', 21, 1, 1, 6, 3, 12, 3, 0, 4, 0, 26)`);

    // Family 4: Rodríguez (monoparental mare) — 1 child
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (4, 3, 2, 'Laura', 'Rodríguez Torres', '600555666', 'laura@mail.com', CURDATE(), '6 mesos', '2018-01-15', 8, 1, 1, 2, 4, 12, 3, 0, 5, 0, 3)`);

    // Family 5: Ferrer (divorci custodia) — 1 child
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (5, 3, 1, 'Marc', 'Ferrer Costa', '600666777', 'marc@mail.com', CURDATE(), '1 any', '2016-09-05', 10, 1, 2, 5, 2, 12, 2, 0, 1, 0, 4)`);

    // ── Edge case clients ──

    // Family 6: Prat (tutor legal extrafamiliar) — 1 child with derivacio_serveis_socials=1
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (6, 3, 1, 'Mohamed', 'Prat Ali', '600777888', 'mohamed@mail.com', CURDATE(), '1 any', '2014-02-28', 12, 86, 4, 4, 4, 1, 1, 1, 6, 0, 7)`);

    // Family 7: Vila (tutor legal intrafamiliar) — toddler, low risk, no NESE
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (7, 3, 2, 'Jana', 'Vila Costa', '600888999', NULL, CURDATE(), '1 mes', '2023-12-01', 3, 1, 1, NULL, 2, 12, NULL, 0, 7, 0, 1)`);

    // Family 8: Casals (biparental) — large family, 3 children
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (8, 3, 1, 'Pau', 'Casals Serrat', '600999000', 'pau@mail.com', CURDATE(), '2 anys', '2011-06-10', 15, 1, 2, 1, 1, 12, 3, 0, 8, 0, 11)`);
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (8, 3, 2, 'Laia', 'Casals Serrat', NULL, 'laia@mail.com', CURDATE(), '1 any', '2017-03-20', 9, 1, 1, 5, 1, 12, 2, 0, 8, 0, 2)`);
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Curs_actual)
        VALUES (8, 1, 2, 'Montse', 'Casals Serrat', '600000111', 'montse@mail.com', CURDATE(), '2 anys', '1985-11-30', 41, 1, 1, 6, 3, 12, NULL, 0, 8, 0, 26)`);

    // ── Baixa client (deactivated) ──
    await conn.query(`INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic, Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial, derivacio_serveis_socials, idDomicili, Baixa, Motiu_baixa, Data_baixa, Curs_actual)
        VALUES (5, 3, 1, 'Arnau', 'Ferrer Costa', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 2 YEAR), '2 anys', '2009-01-15', 17, 1, 1, 1, 1, 12, 3, 0, 1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 26)`);

    // ── Project-Client associations ──
    // Projecte Actiu (id 2): assign client 1 (Joan), 5 (Pedro)
    await conn.query(`INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES (2, 1)`);
    await conn.query(`INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES (2, 5)`);
    // Projecte Futur (id 3): assign client 2 (Maria)
    await conn.query(`INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES (3, 2)`);
    // Projecte Passat (id 4): assign client 9 (Marc), 10 (Mohamed)
    await conn.query(`INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES (4, 9)`);
    await conn.query(`INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES (4, 10)`);
    // Projecte Complet (id 5): assign client 7 (Laura)
    await conn.query(`INSERT INTO proyectos_has_client (idProyecto, idClient) VALUES (5, 7)`);

    // ── Responsables ──
    await conn.query(`INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP) VALUES (2, 2)`);
    await conn.query(`INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP) VALUES (3, 1)`);

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
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
