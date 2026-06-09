const pool = require("../config/database");

async function search({ tipus_via, q }) {
    let sql = `
        SELECT
            d.idDireccio,
            d.Nom_calle,
            CONCAT(tv.Nom, ' ', d.Nom_calle) AS Nom_complet,
            tv.idTipus_via,
            tv.Nom AS tipus_via,
            b.idBarri,
            b.Nom AS barri,
            cp.idCodi_postal,
            cp.Codi AS codi_postal
        FROM direccio d
        JOIN tipus_via tv ON tv.idTipus_via = d.idTipus_via
        LEFT JOIN barri b ON b.idBarri = d.idBarri
        LEFT JOIN codi_postal cp ON cp.idCodi_postal = d.idCodi_postal
        WHERE 1=1
    `;
    const params = [];

    if (tipus_via) {
        sql += ` AND d.idTipus_via = ?`;
        params.push(tipus_via);
    }

    if (q && q.length >= 3) {
        sql += ` AND CONCAT(tv.Nom, ' ', d.Nom_calle) LIKE ?`;
        params.push(`%${q}%`);
    }

    sql += ` ORDER BY tv.Nom, d.Nom_calle, b.Nom, cp.Codi LIMIT 50`;

    const [rows] = await pool.query(sql, params);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT
            d.idDireccio,
            d.Nom_calle,
            CONCAT(tv.Nom, ' ', d.Nom_calle) AS Nom_complet,
            tv.idTipus_via,
            tv.Nom AS tipus_via,
            b.idBarri,
            b.Nom AS barri,
            cp.idCodi_postal,
            cp.Codi AS codi_postal
        FROM direccio d
        JOIN tipus_via tv ON tv.idTipus_via = d.idTipus_via
        LEFT JOIN barri b ON b.idBarri = d.idBarri
        LEFT JOIN codi_postal cp ON cp.idCodi_postal = d.idCodi_postal
        WHERE d.idDireccio = ?
        `,
        [id]
    );
    return rows[0] || null;
}

module.exports = {
    search,
    getById
};
