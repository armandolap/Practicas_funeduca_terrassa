const { createPool } = require("../config/database");

const pool = createPool();

async function search({ tipus_via, q }) {
    let sql = `
        SELECT
            c.idcallejero,
            c.Nom_calle,
            CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet,
            tv.idTipus_via,
            tv.Nom AS tipus_via,
            b.idBarri,
            b.Nom AS barri,
            cp.idCodi_postal,
            cp.Codi AS codi_postal
        FROM callejero c
        JOIN tipus_via tv ON tv.idTipus_via = c.idTipus_via
        LEFT JOIN barri b ON b.idBarri = c.idBarri
        LEFT JOIN codi_postal cp ON cp.idCodi_postal = c.idCodi_postal
        WHERE 1=1
    `;
    const params = [];

    if (tipus_via) {
        sql += ` AND c.idTipus_via = ?`;
        params.push(tipus_via);
    }

    if (q && q.length >= 3) {
        sql += ` AND (c.Nom_calle LIKE ? OR CONCAT(tv.Nom, ' ', c.Nom_calle) LIKE ?)`;
        params.push(`%${q}%`, `%${q}%`);
    }

    sql += ` ORDER BY tv.Nom, c.Nom_calle LIMIT 50`;

    const [rows] = await pool.query(sql, params);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            c.idcallejero,
            c.Nom_calle,
            CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet,
            tv.idTipus_via,
            tv.Nom AS tipus_via,
            b.idBarri,
            b.Nom AS barri,
            cp.idCodi_postal,
            cp.Codi AS codi_postal
        FROM callejero c
        JOIN tipus_via tv ON tv.idTipus_via = c.idTipus_via
        LEFT JOIN barri b ON b.idBarri = c.idBarri
        LEFT JOIN codi_postal cp ON cp.idCodi_postal = c.idCodi_postal
        WHERE c.idcallejero = ?
        `,
        [id]
    );
    return rows[0] || null;
}

module.exports = {
    search,
    getById
};
