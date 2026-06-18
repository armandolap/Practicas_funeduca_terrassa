const { createPool } = require("../config/database");
const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT dm.*, td.Nom_domicili AS tipus_domicili_nom,
               dir.Num_calle, dir.Pis, dir.Escala,
               c.Nom_calle, tv.Nom AS tipus_via,
               b.Nom AS barri, cp.Codi AS codi_postal
        FROM domicili dm
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        ORDER BY dm.idDomicili
    `);
    return rows;
}

async function getFiltered({ barri, tipus, offset = 0, limit = 15 }) {
    let sql = `
        SELECT SQL_CALC_FOUND_ROWS dm.*, td.Nom_domicili AS tipus_domicili_nom,
               dir.Num_calle, dir.Pis, dir.Escala,
               c.Nom_calle, tv.Nom AS tipus_via,
               b.Nom AS barri, cp.Codi AS codi_postal,
               (SELECT COUNT(*) FROM client cl WHERE cl.idDomicili = dm.idDomicili) AS quantitat_gent,
               (SELECT f.Cognom_familiar FROM client cl
                JOIN familia f ON cl.idFamilia = f.idFamilia
                WHERE cl.idDomicili = dm.idDomicili LIMIT 1) AS familia_principal
        FROM domicili dm
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE 1=1
    `;
    const params = [];
    if (barri) { sql += ` AND c.idBarri = ?`; params.push(barri); }
    if (tipus) { sql += ` AND dm.Tipus_domicili = ?`; params.push(tipus); }
    sql += ` ORDER BY dm.idDomicili LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query(`SELECT FOUND_ROWS() AS total`);
    return { rows, total };
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT dm.*, td.Nom_domicili AS tipus_domicili_nom,
               dir.Num_calle, dir.Pis, dir.Escala,
               c.Nom_calle, tv.Nom AS tipus_via,
               b.Nom AS barri, cp.Codi AS codi_postal
        FROM domicili dm
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE dm.idDomicili = ?
    `, [id]);
    return rows[0] || null;
}

async function getDetailById(id) {
    const domicili = await getById(id);
    if (!domicili) return null;

    const [persones] = await pool.query(`
        SELECT cl.idClient, cl.Nom, cl.Cognoms, cl.C_edad, cl.Baixa,
               f.Cognom_familiar, f.idFamilia,
               g.Nom_genere, r.Nom_rol
        FROM client cl
        JOIN familia f ON cl.idFamilia = f.idFamilia
        JOIN genere g ON cl.idGenere = g.idGenere
        JOIN rol r ON cl.idRol = r.idRol
        WHERE cl.idDomicili = ?
    `, [id]);

    const [families] = await pool.query(`
        SELECT DISTINCT f.idFamilia, f.Cognom_familiar, f.Estructura_familiar,
               ef.Nom_est_fam AS estructura_familiar_nom,
               (SELECT COUNT(*) FROM client cl WHERE cl.idFamilia = f.idFamilia) AS num_membres
        FROM client cl
        JOIN familia f ON cl.idFamilia = f.idFamilia
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        WHERE cl.idDomicili = ?
    `, [id]);

    const [projectes] = await pool.query(`
        SELECT DISTINCT p.idProyecto, p.Nom_projecte, p.fecha_inicio_act, p.fecha_fin_act
        FROM proyectos_has_client phc
        JOIN proyectos p ON phc.idProyecto = p.idProyecto
        WHERE phc.idClient IN (SELECT idClient FROM client WHERE idDomicili = ?)
        ORDER BY p.Nom_projecte
    `, [id]);

    return { ...domicili, persones, families, projectes };
}

async function create(idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (?, ?)`,
        [idTipusDomicili, direccio]
    );
    return result.insertId;
}

async function update(id, idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `UPDATE domicili SET Tipus_domicili = ?, Direccio = ? WHERE idDomicili = ?`,
        [idTipusDomicili, direccio, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(`DELETE FROM domicili WHERE idDomicili = ?`, [id]);
    return result.affectedRows;
}

async function getByFamily(idFamilia) {
    const [rows] = await pool.query(`
        SELECT DISTINCT dm.*, td.Nom_domicili,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet
        FROM client cl
        JOIN domicili dm ON cl.idDomicili = dm.idDomicili
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE cl.idFamilia = ?
        ORDER BY dm.idDomicili
    `, [idFamilia]);
    return rows;
}

async function searchCombined({ q, tipus_via, idFamilia }) {
    const results = [];
    if (idFamilia) {
        let sql = `
            SELECT DISTINCT dm.idDomicili, dm.Tipus_domicili, td.Nom_domicili,
                   dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
                   c.idcallejero, c.Nom_calle, tv.idTipus_via, tv.Nom AS tipus_via,
                   b.idBarri, b.Nom AS barri, cp.idCodi_postal, cp.Codi AS codi_postal,
                   CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet, 'domicili' AS _type
             FROM client cl
            JOIN domicili dm ON cl.idDomicili = dm.idDomicili
            JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
            JOIN direccio dir ON dm.Direccio = dir.idDireccio
            JOIN callejero c ON dir.idcallejero = c.idcallejero
            JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
            JOIN barri b ON c.idBarri = b.idBarri
            JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
            WHERE cl.idFamilia = ?
        `;
        const params = [idFamilia];
        if (tipus_via) { sql += ` AND c.idTipus_via = ?`; params.push(tipus_via); }
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
            SELECT c.idcallejero, NULL AS idDomicili, NULL AS Tipus_domicili, NULL AS Nom_domicili,
                   NULL AS idDireccio, NULL AS Num_calle, NULL AS Pis, NULL AS Escala,
                   c.Nom_calle, tv.idTipus_via, tv.Nom AS tipus_via,
                   b.idBarri, b.Nom AS barri, cp.idCodi_postal, cp.Codi AS codi_postal,
                   CONCAT(tv.Nom, ' ', c.Nom_calle) AS Nom_complet, 'callejero' AS _type
            FROM callejero c
            JOIN tipus_via tv ON tv.idTipus_via = c.idTipus_via
            LEFT JOIN barri b ON b.idBarri = c.idBarri
            LEFT JOIN codi_postal cp ON cp.idCodi_postal = c.idCodi_postal
            WHERE 1=1
        `;
        const params = [];
        if (tipus_via) { sql += ` AND c.idTipus_via = ?`; params.push(tipus_via); }
        if (q && q.length >= 3) {
            sql += ` AND (c.Nom_calle LIKE ? OR CONCAT(tv.Nom, ' ', c.Nom_calle) LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
        if (q && q.length < 3 && !tipus_via) sql += ` AND 1=0`;
        sql += ` ORDER BY tv.Nom, c.Nom_calle LIMIT ${idFamilia ? 30 : 50}`;
        const [rows] = await pool.query(sql, params);
        results.push(...rows);
    }
    return results;
}

module.exports = { getAll, getFiltered, getById, getDetailById, create, update, remove, getByFamily, searchCombined };
