const path = require("path");
const fs = require("fs");
const pool = require("../config/database");

async function carregaCallejero() {
    const stagingTable = "_staging_calles";

    await pool.query(`
        CREATE TABLE IF NOT EXISTS \`${stagingTable}\` (
            codi_carrer VARCHAR(10),
            des_sigla VARCHAR(50),
            nom_carrer VARCHAR(255),
            nom_complert VARCHAR(255),
            nom_barri VARCHAR(100),
            codi_postal VARCHAR(10),
            nroi INT,
            nrof INT,
            nom_llistat VARCHAR(50)
        )
    `);

    await pool.query(`DELETE FROM callejero`);
    await pool.query(`DELETE FROM tipus_via`);
    await pool.query(`DELETE FROM barri`);
    await pool.query(`DELETE FROM codi_postal`);
    await pool.query(`DELETE FROM \`${stagingTable}\``);

    const rawSql = fs.readFileSync(
        path.join(__dirname, "..", "sql", "inserts_calles.sql"),
        "utf8"
    );
    const modifiedSql = rawSql.replace(/tu_nombre_de_tabla/g, `\`${stagingTable}\``);
    const statements = modifiedSql.split(";").filter(s => s.trim().length > 0);

    for (const stmt of statements) {
        await pool.query(stmt);
    }

    await pool.query(`
        INSERT IGNORE INTO tipus_via (Nom)
        SELECT DISTINCT des_sigla FROM \`${stagingTable}\`
        ORDER BY des_sigla
    `);

    await pool.query(`
        INSERT IGNORE INTO barri (Nom)
        SELECT DISTINCT nom_barri FROM \`${stagingTable}\`
        ORDER BY nom_barri
    `);

    await pool.query(`
        INSERT IGNORE INTO codi_postal (Codi)
        SELECT DISTINCT codi_postal FROM \`${stagingTable}\`
        ORDER BY codi_postal
    `);

    await pool.query(`
        INSERT IGNORE INTO callejero (idTipus_via, Nom_calle, Nom_complet, idBarri, idCodi_postal)
        SELECT DISTINCT
            tv.idTipus_via,
            s.nom_carrer,
            s.nom_complert,
            b.idBarri,
            cp.idCodi_postal
        FROM \`${stagingTable}\` s
        JOIN tipus_via tv ON tv.Nom = s.des_sigla
        LEFT JOIN barri b ON b.Nom = s.nom_barri
        LEFT JOIN codi_postal cp ON cp.Codi = s.codi_postal
    `);

    await pool.query(`DROP TABLE IF EXISTS \`${stagingTable}\``);

    console.log("Callejero carregat correctament");
}

module.exports = { carregaCallejero };
