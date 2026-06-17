const { createPool } = require("../config/database");
const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT f.*, ef.Nom_est_fam AS estructura_familiar_nom
        FROM familia f
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        ORDER BY f.Cognom_familiar
    `);
    return rows;
}

async function getFiltered({ q, estructura, barri, offset = 0, limit = 15 }) {
    let sql = `
        SELECT SQL_CALC_FOUND_ROWS f.*, ef.Nom_est_fam AS estructura_familiar_nom,
               (SELECT COUNT(*) FROM client cl WHERE cl.idFamilia = f.idFamilia) AS num_membres,
               (SELECT COUNT(*) FROM client cl WHERE cl.idFamilia = f.idFamilia AND cl.C_edad >= 18) AS num_majors,
               (SELECT COUNT(*) FROM client cl WHERE cl.idFamilia = f.idFamilia AND cl.C_edad < 18) AS num_menors,
               (SELECT cl.idDomicili FROM client cl WHERE cl.idFamilia = f.idFamilia LIMIT 1) AS idDomicili_principal
        FROM familia f
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        WHERE 1=1
    `;
    const params = [];

    if (q && q.trim()) {
        sql += ` AND f.Cognom_familiar LIKE ?`;
        params.push(`%${q.trim()}%`);
    }
    if (estructura) {
        sql += ` AND f.Estructura_familiar = ?`;
        params.push(estructura);
    }
    if (barri) {
        sql += ` AND EXISTS (
            SELECT 1 FROM client cl
            JOIN domicili dm ON cl.idDomicili = dm.idDomicili
            JOIN direccio dir ON dm.Direccio = dir.idDireccio
            JOIN callejero c ON dir.idcallejero = c.idcallejero
            WHERE cl.idFamilia = f.idFamilia AND c.idBarri = ?
        )`;
        params.push(barri);
    }

    sql += ` ORDER BY f.Cognom_familiar LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query(`SELECT FOUND_ROWS() AS total`);
    return { rows, total };
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT f.*, ef.Nom_est_fam AS estructura_familiar_nom
        FROM familia f
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        WHERE f.idFamilia = ?
    `, [id]);
    return rows[0] || null;
}

async function getDetailById(id) {
    const familia = await getById(id);
    if (!familia) return null;

    const [domicilis] = await pool.query(`
        SELECT DISTINCT dm.*, td.Nom_domicili AS tipus_domicili_nom,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle, tv.Nom AS tipus_via,
               b.Nom AS barri, cp.Codi AS codi_postal
        FROM client cl
        JOIN domicili dm ON cl.idDomicili = dm.idDomicili
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE cl.idFamilia = ?
    `, [id]);

    const [membres] = await pool.query(`
        SELECT cl.*, g.Nom_genere, r.Nom_rol,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idClient = cl.idClient) AS num_projectes
        FROM client cl
        JOIN genere g ON cl.idGenere = g.idGenere
        JOIN rol r ON cl.idRol = r.idRol
        WHERE cl.idFamilia = ?
        ORDER BY cl.C_edad DESC
    `, [id]);

    const [projectes] = await pool.query(`
        SELECT DISTINCT p.*
        FROM proyectos_has_client phc
        JOIN proyectos p ON phc.idProyecto = p.idProyecto
        WHERE phc.idClient IN (SELECT idClient FROM client WHERE idFamilia = ?)
        ORDER BY p.Nom_projecte
    `, [id]);

    return { ...familia, domicilis, membres, projectes };
}

async function create(cognomFamiliar, idDomicili, estructuraFamiliar) {
    const [result] = await pool.query(
        `INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES (?, ?)`,
        [cognomFamiliar, estructuraFamiliar]
    );
    return result.insertId;
}

async function update(id, cognomFamiliar, idDomicili, estructuraFamiliar) {
    const [result] = await pool.query(
        `UPDATE familia SET Cognom_familiar = ?, Estructura_familiar = ? WHERE idFamilia = ?`,
        [cognomFamiliar, estructuraFamiliar, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(`DELETE FROM familia WHERE idFamilia = ?`, [id]);
    return result.affectedRows;
}

async function existsByName(name) {
    const [rows] = await pool.query(
        `SELECT idFamilia, Cognom_familiar FROM familia WHERE Cognom_familiar = ?`, [name]
    );
    return rows.length > 0 ? rows[0] : null;
}

async function searchByName(query) {
    const [rows] = await pool.query(`
        SELECT idFamilia, Cognom_familiar, Estructura_familiar
        FROM familia WHERE Cognom_familiar LIKE ?
        ORDER BY Cognom_familiar LIMIT 20
    `, [`%${query}%`]);
    return rows;
}

module.exports = { getAll, getFiltered, getById, getDetailById, create, update, remove, existsByName, searchByName };
