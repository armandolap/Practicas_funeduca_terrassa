const { createPool } = require("../config/database");

const pool = createPool();

async function projectesGeneresEdats() {
    const [gen] = await pool.query(`SELECT idGenere, Nom_genere FROM genere ORDER BY idGenere`);
    const segments = ['0-3', '4-6', '7-9', '10-12', '13-15', '16-18', '18-30', '30-65', '+65'];

    const ageCase = `
        CASE
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 0 AND 3 THEN '0-3'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 4 AND 6 THEN '4-6'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 7 AND 9 THEN '7-9'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 10 AND 12 THEN '10-12'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 13 AND 15 THEN '13-15'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 16 AND 18 THEN '16-18'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 19 AND 30 THEN '18-30'
            WHEN TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN 31 AND 65 THEN '30-65'
            ELSE '+65'
        END
    `;

    const cols = [];
    for (const g of gen) {
        const safeName = g.Nom_genere.replace(/[^a-zA-Z0-9_]/g, '_');
        for (const s of segments) {
            const alias = `${safeName}_${s}`;
            cols.push(`SUM(CASE WHEN g.Nom_genere = ${pool.escape(g.Nom_genere)} AND age_group = ${pool.escape(s)} THEN 1 ELSE 0 END) AS \`${alias}\``);
        }
    }

    const totalCols = segments.map(s => `SUM(CASE WHEN age_group = ${pool.escape(s)} THEN 1 ELSE 0 END) AS \`total_${s}\``);

    const sql = `
        SELECT
            p.idProyecto,
            p.Nom_projecte,
            ${cols.join(',\n            ')}${cols.length ? ',' : ''}
            ${totalCols.join(',\n            ')}${totalCols.length ? ',' : ''}
            COUNT(*) AS total
        FROM (
            SELECT
                phc.idProyecto,
                phc.idClient,
                g.Nom_genere,
                ${ageCase} AS age_group
            FROM proyectos_has_client phc
            JOIN client c ON c.idClient = phc.idClient
            JOIN genere g ON g.idGenere = c.idGenere
        ) sub
        JOIN proyectos p ON p.idProyecto = sub.idProyecto
        GROUP BY p.idProyecto, p.Nom_projecte
        ORDER BY p.Nom_projecte
    `;

    const [rows] = await pool.query(sql);
    return rows;
}

async function genere() {
    const [rows] = await pool.query(`
        SELECT g.Nom_genere, COUNT(*) AS total
        FROM Client c
        JOIN Genere g ON c.idGenere = g.idGenere
        WHERE YEAR(Data_d_alta) = YEAR(CURDATE())
        GROUP BY g.idGenere
    `);
    return rows;
}

async function sitEco() {
    const [rows] = await pool.query(`
        SELECT se.Nom AS situacio, r.Nom_rol AS rol, COUNT(*) AS total
        FROM Client c
        JOIN situacio_economica se ON c.idSituacio_economica = se.idSituacio_economica
        JOIN Rol r ON c.idRol = r.idRol
        GROUP BY se.idSituacio_economica, r.idRol
    `);
    return rows;
}

async function rolFam() {
    const [rows] = await pool.query(`
        SELECT r.Nom_rol, COUNT(*) AS total
        FROM Client c
        JOIN Rol r ON c.idRol = r.idRol
        WHERE YEAR(Data_d_alta) = YEAR(CURDATE())
        GROUP BY r.idRol
    `);
    return rows;
}

async function tipHab() {
    const [rows] = await pool.query(`
        SELECT td.Nom_domicili, COUNT(*) AS total
        FROM Domicili d
        JOIN tipus_domicili td ON d.Tipus_domicili = td.idTipus_domicili
        GROUP BY d.Tipus_domicili
    `);
    return rows;
}

async function cont() {
    const [rows] = await pool.query(`
        SELECT
            (SELECT COUNT(DISTINCT idClient) FROM Client) AS total_usuaris,
            (SELECT COUNT(*) FROM Familia) AS total_families,
            (SELECT COUNT(*) FROM Client WHERE Baixa = 1) AS baixa_total,
            (SELECT COUNT(*) FROM Client c JOIN Genere g ON c.idGenere = g.idGenere WHERE c.Baixa = 1 AND g.Nom_genere LIKE '%Femen%') AS baixa_dones,
            (SELECT COUNT(*) FROM Client c JOIN Genere g ON c.idGenere = g.idGenere WHERE c.Baixa = 1 AND g.Nom_genere LIKE '%Mascul%') AS baixa_homes
    `);
    return rows[0];
}

async function neses() {
    const [rows] = await pool.query(`
        SELECT ne.Nom_necessitat, g.Nom_genere, COUNT(*) AS total
        FROM Client c
        JOIN necessitats_especials ne ON c.idNecessitat_especial = ne.idNecessitat_especial
        JOIN Genere g ON c.idGenere = g.idGenere
        WHERE c.idNecessitat_especial IS NOT NULL
        GROUP BY ne.idNecessitat_especial, g.idGenere
    `);
    return rows;
}

async function sebasDev() {
    const [rows] = await pool.query(`
        SELECT s.Nom AS sebas_nom, COUNT(*) AS total
        FROM Client c
        JOIN sebas s ON c.idSebas = s.idSebas
        GROUP BY s.idSebas
    `);
    return rows;
}

async function cursAny(any) {
    const [rows] = await pool.query(`
        SELECT ca.Nom AS curs, ra.Nom_resultat_acad, COUNT(*) AS total
        FROM Client c
        JOIN curs_actual ca ON c.Curs_actual = ca.idCurs_actual
        JOIN resultat_academic ra ON c.Resultat_academic = ra.idResultat_academic
        WHERE YEAR(c.Data_d_alta) = ?
        GROUP BY ca.idCurs_actual, ra.idResultat_academic
    `, [any]);
    return rows;
}

async function resAcad() {
    const [rows] = await pool.query(`
        SELECT ra.Nom_resultat_acad, COUNT(*) AS total
        FROM Client c
        JOIN resultat_academic ra ON c.Resultat_academic = ra.idResultat_academic
        GROUP BY ra.idResultat_academic
    `);
    return rows;
}

async function motiusBaixa() {
    const [rows] = await pool.query(`
        SELECT mb.Nom_motiu_baixa, COUNT(*) AS total
        FROM Client c
        JOIN motiu_baixa mb ON c.Motiu_baixa = mb.idMotiu_baixa
        GROUP BY mb.idMotiu_baixa
    `);
    return rows;
}

async function riscos() {
    const [rows] = await pool.query(`
        SELECT r.Nivel, COUNT(*) AS total
        FROM Client c
        JOIN risc r ON c.Risc = r.idRisc
        GROUP BY r.idRisc
    `);
    return rows;
}

async function paisos() {
    const [rows] = await pool.query(`
        SELECT p.Nom_pais,
               COUNT(DISTINCT n.idClient) AS nacionalitat,
               COUNT(DISTINCT c.idClient) AS naixement
        FROM Pais p
        LEFT JOIN nacionalitat n ON p.idPais = n.idPais
        LEFT JOIN Client c ON p.idPais = c.Pais_naixement
        GROUP BY p.idPais
    `);
    return rows;
}

module.exports = {
    projectesGeneresEdats,
    genere,
    sitEco,
    rolFam,
    tipHab,
    cont,
    neses,
    sebasDev,
    cursAny,
    resAcad,
    motiusBaixa,
    riscos,
    paisos
};
