const pool = require("../config/database");

async function search({ tipus_via, q }) {
    let sql = `
        SELECT
            c.idCallejero,
            c.Nom_calle,
            c.Nom_complet,
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
        sql += ` AND c.Nom_complet LIKE ?`;
        params.push(`%${q}%`);
    }

    sql += ` ORDER BY c.Nom_complet LIMIT 50`;

    const [rows] = await pool.query(sql, params);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            c.idCallejero,
            c.Nom_calle,
            c.Nom_complet,
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
        WHERE c.idCallejero = ?
        `,
        [id]
    );
    return rows[0] || null;
}

module.exports = {
    search,
    getById
};
