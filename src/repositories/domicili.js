const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Domicili
        ORDER BY idDomicili
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM Domicili
        WHERE idDomicili = ?
        `,
        [id]
    );

    return rows[0] || null;
}

async function create(idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `
        INSERT INTO Domicili
        (Tipus_domicili, Direccio)
        VALUES (?, ?)
        `,
        [idTipusDomicili, direccio]
    );

    return result.insertId;
}

async function update(id, idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `
        UPDATE Domicili
        SET
            Tipus_domicili = ?,
            Direccio = ?
        WHERE idDomicili = ?
        `,
        [idTipusDomicili, direccio, id]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `
        DELETE FROM Domicili
        WHERE idDomicili = ?
        `,
        [id]
    );

    return result.affectedRows;
}

async function getByFamily(idFamilia) {
    const [rows] = await pool.query(
        `
        SELECT DISTINCT
            dm.idDomicili,
            dm.Tipus_domicili,
            td.Nom_domicili,
            dir.idDireccio,
            dir.Num_calle,
            dir.Pis,
            dir.Escala,
            c.idcallejero,
            c.Nom_calle,
            tv.idTipus_via,
            tv.Nom AS tipus_via,
            b.idBarri,
            b.Nom AS barri,
            cp.idCodi_postal,
            cp.Codi AS codi_postal,
            CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet
        FROM Client cl
        JOIN Domicili dm ON cl.idDomicili = dm.idDomicili
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE cl.idFamilia = ?
        ORDER BY dm.idDomicili
        `,
        [idFamilia]
    );
    return rows;
}

async function searchCombined({ q, tipus_via, idFamilia }) {
    const results = [];

    // 1. If family selected, search their domiciles
    if (idFamilia) {
        let sql = `
            SELECT DISTINCT
                dm.idDomicili,
                dm.Tipus_domicili,
                td.Nom_domicili,
                dir.idDireccio,
                dir.Num_calle,
                dir.Pis,
                dir.Escala,
                c.idcallejero,
                c.Nom_calle,
                tv.idTipus_via,
                tv.Nom AS tipus_via,
                b.idBarri,
                b.Nom AS barri,
                cp.idCodi_postal,
                cp.Codi AS codi_postal,
                CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet,
                'domicili' AS _type
            FROM Client cl
            JOIN Domicili dm ON cl.idDomicili = dm.idDomicili
            JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
            JOIN direccio dir ON dm.Direccio = dir.idDireccio
            JOIN callejero c ON dir.idcallejero = c.idcallejero
            JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
            JOIN barri b ON c.idBarri = b.idBarri
            JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
            WHERE cl.idFamilia = ?
        `;
        const params = [idFamilia];

        if (tipus_via) {
            sql += ` AND c.idTipus_via = ?`;
            params.push(tipus_via);
        }

        if (q && q.length >= 2) {
            sql += ` AND (c.Nom_calle LIKE ? OR CONCAT(tv.Nom, ' ', c.Nom_calle) LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }

        sql += ` ORDER BY dm.idDomicili LIMIT 20`;

        const [rows] = await pool.query(sql, params);
        results.push(...rows);
    }

    // 2. Search callejero catalog
    if (!tipus_via || tipus_via) {
        let sql = `
            SELECT
                c.idcallejero,
                NULL AS idDomicili,
                NULL AS Tipus_domicili,
                NULL AS Nom_domicili,
                NULL AS idDireccio,
                NULL AS Num_calle,
                NULL AS Pis,
                NULL AS Escala,
                c.Nom_calle,
                tv.idTipus_via,
                tv.Nom AS tipus_via,
                b.idBarri,
                b.Nom AS barri,
                cp.idCodi_postal,
                cp.Codi AS codi_postal,
                CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet,
                'callejero' AS _type
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

        if (q && q.length < 3 && (!tipus_via)) {
            // Don't search callejero without enough criteria
            sql += ` AND 1=0`;
        }

        sql += ` ORDER BY tv.Nom, c.Nom_calle LIMIT ${idFamilia ? 30 : 50}`;

        const [rows] = await pool.query(sql, params);
        results.push(...rows);
    }

    return results;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getByFamily,
    searchCombined
};
