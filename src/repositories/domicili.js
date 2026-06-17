const { createPool } = require("../config/database");

const pool = createPool();

async function getAll(filters = {}) {
    const { barri, tipus, offset = 0, limit = 15 } = filters;
    const params = [];
    const conditions = [];

    if (barri) {
        conditions.push(`cal.idBarri = ?`);
        params.push(barri);
    }
    if (tipus) {
        conditions.push(`dm.Tipus_domicili = ?`);
        params.push(tipus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(`
        SELECT dm.idDomicili, dm.Tipus_domicili, td.Nom_domicili,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               cal.idcallejero, cal.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               CONCAT(tv.Nom, ' ', cal.Nom_calle, ', ', dir.Num_calle) AS adreca_completa,
               (SELECT COUNT(*) FROM Client WHERE idDomicili = dm.idDomicili) AS quantitat_gent
        FROM Domicili dm
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN Direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero cal ON dir.idcallejero = cal.idcallejero
        JOIN tipus_via tv ON cal.idTipus_via = tv.idTipus_via
        JOIN barri b ON cal.idBarri = b.idBarri
        JOIN codi_postal cp ON cal.idCodi_postal = cp.idCodi_postal
        ${whereClause}
        ORDER BY cal.Nom_calle, dir.Num_calle
        LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM Domicili WHERE idDomicili = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getByIdEnhanced(id) {
    const [domRows] = await pool.query(`
        SELECT dm.*, td.Nom_domicili,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               cal.idcallejero, cal.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               CONCAT(tv.Nom, ' ', cal.Nom_calle, ', ', dir.Num_calle) AS adreca_completa
        FROM Domicili dm
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN Direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero cal ON dir.idcallejero = cal.idcallejero
        JOIN tipus_via tv ON cal.idTipus_via = tv.idTipus_via
        JOIN barri b ON cal.idBarri = b.idBarri
        JOIN codi_postal cp ON cal.idCodi_postal = cp.idCodi_postal
        WHERE dm.idDomicili = ?
    `, [id]);

    if (domRows.length === 0) return null;

    const domicili = domRows[0];

    const [persones] = await pool.query(`
        SELECT c.idClient, c.Nom, c.Cognoms, c.Baixa AS estat, c.idFamilia, f.Cognom_familiar
        FROM Client c
        JOIN Familia f ON c.idFamilia = f.idFamilia
        WHERE c.idDomicili = ?
        ORDER BY c.Cognoms, c.Nom
    `, [id]);

    const [families] = await pool.query(`
        SELECT f.idFamilia, f.Cognom_familiar,
               (SELECT COUNT(*) FROM Client WHERE idFamilia = f.idFamilia) AS num_membres,
               f.Estructura_familiar
        FROM Client c
        JOIN Familia f ON c.idFamilia = f.idFamilia
        WHERE c.idDomicili = ?
        GROUP BY f.idFamilia, f.Cognom_familiar, f.Estructura_familiar
        ORDER BY f.Cognom_familiar
    `, [id]);

    const [projectes] = await pool.query(`
        SELECT DISTINCT p.*
        FROM proyectos_has_client phc
        JOIN Proyectos p ON phc.idProyecto = p.idProyecto
        JOIN Client c ON phc.idClient = c.idClient
        WHERE c.idDomicili = ?
        ORDER BY p.Nom_projecte
    `, [id]);

    return {
        ...domicili,
        persones,
        families,
        projectes
    };
}

async function create(idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (?, ?)`,
        [idTipusDomicili, direccio]
    );
    return result.insertId;
}

async function update(id, idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `UPDATE Domicili SET Tipus_domicili = ?, Direccio = ? WHERE idDomicili = ?`,
        [idTipusDomicili, direccio, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM Domicili WHERE idDomicili = ?`,
        [id]
    );
    return result.affectedRows;
}

async function getByFamily(idFamilia) {
    const [rows] = await pool.query(
        `SELECT DISTINCT
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
        ORDER BY dm.idDomicili`,
        [idFamilia]
    );
    return rows;
}

async function searchCombined({ q, tipus_via, idFamilia }) {
    const results = [];

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
    getByIdEnhanced,
    create,
    update,
    remove,
    getByFamily,
    searchCombined
};
