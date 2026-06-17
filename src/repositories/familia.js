const { createPool } = require("../config/database");

const pool = createPool();

async function getAll(filters = {}) {
    const { q, estructura, barri, offset = 0, limit = 15 } = filters;
    const params = [];
    const conditions = [];

    if (q && q.trim()) {
        conditions.push(`f.Cognom_familiar LIKE ?`);
        params.push(`%${q.trim()}%`);
    }
    if (estructura) {
        conditions.push(`f.Estructura_familiar = ?`);
        params.push(estructura);
    }
    if (barri) {
        conditions.push(`EXISTS (
            SELECT 1 FROM Client c
            JOIN Domicili d ON c.idDomicili = d.idDomicili
            JOIN Direccio dir ON d.Direccio = dir.idDireccio
            JOIN callejero cal ON dir.idcallejero = cal.idcallejero
            WHERE c.idFamilia = f.idFamilia AND cal.idBarri = ?
        )`);
        params.push(barri);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(`
        SELECT f.*,
               ef.Nom_est_fam,
               (SELECT COUNT(*) FROM Client WHERE idFamilia = f.idFamilia) AS num_membres,
               (SELECT COUNT(*) FROM Client WHERE idFamilia = f.idFamilia AND TIMESTAMPDIFF(YEAR, Fecha_nacimiento, CURDATE()) < 18) AS num_menors,
               (SELECT COUNT(*) FROM Client WHERE idFamilia = f.idFamilia AND TIMESTAMPDIFF(YEAR, Fecha_nacimiento, CURDATE()) >= 18) AS num_majors,
               (SELECT CONCAT(tv.Nom, ' ', cal.Nom_calle, ', ', dir.Num_calle)
                FROM Client c
                JOIN Domicili d ON c.idDomicili = d.idDomicili
                JOIN Direccio dir ON d.Direccio = dir.idDireccio
                JOIN callejero cal ON dir.idcallejero = cal.idcallejero
                JOIN tipus_via tv ON cal.idTipus_via = tv.idTipus_via
                WHERE c.idFamilia = f.idFamilia
                LIMIT 1) AS domicili_principal
        FROM Familia f
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        ${whereClause}
        ORDER BY f.Cognom_familiar
        LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM Familia WHERE idFamilia = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getByIdEnhanced(id) {
    const [familyRows] = await pool.query(`
        SELECT f.*, ef.Nom_est_fam
        FROM Familia f
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        WHERE f.idFamilia = ?
    `, [id]);

    if (familyRows.length === 0) return null;

    const family = familyRows[0];

    const [domicilis] = await pool.query(`
        SELECT DISTINCT dm.idDomicili, dm.Tipus_domicili,
               td.Nom_domicili,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               cal.idcallejero, cal.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               CONCAT(tv.Nom, ' ', cal.Nom_calle, ', ', dir.Num_calle) AS adreca_completa
        FROM Client c
        JOIN Domicili dm ON c.idDomicili = dm.idDomicili
        JOIN tipus_domicili td ON dm.Tipus_domicili = td.idTipus_domicili
        JOIN Direccio dir ON dm.Direccio = dir.idDireccio
        JOIN callejero cal ON dir.idcallejero = cal.idcallejero
        JOIN tipus_via tv ON cal.idTipus_via = tv.idTipus_via
        JOIN barri b ON cal.idBarri = b.idBarri
        JOIN codi_postal cp ON cal.idCodi_postal = cp.idCodi_postal
        WHERE c.idFamilia = ?
        ORDER BY dm.idDomicili
    `, [id]);

    const [membres] = await pool.query(`
        SELECT c.idClient, c.Nom, c.Cognoms, c.idRol, r.Nom_rol, c.C_edad, c.Fecha_nacimiento
        FROM Client c
        JOIN Rol r ON c.idRol = r.idRol
        WHERE c.idFamilia = ?
        ORDER BY c.Cognoms, c.Nom
    `, [id]);

    const [projectes] = await pool.query(`
        SELECT DISTINCT p.*
        FROM proyectos_has_client phc
        JOIN Proyectos p ON phc.idProyecto = p.idProyecto
        JOIN Client c ON phc.idClient = c.idClient
        WHERE c.idFamilia = ?
        ORDER BY p.Nom_projecte
    `, [id]);

    return {
        ...family,
        domicilis,
        membres,
        projectes
    };
}

async function create(cognomFamiliar, idDomicili, estructuraFamiliar) {
    const [result] = await pool.query(
        `INSERT INTO Familia (
            Cognom_familiar,
            idDomicili,
            Estructura_familiar
        ) VALUES (?, ?, ?)`,
        [cognomFamiliar, idDomicili, estructuraFamiliar]
    );

    return result.insertId;
}

async function update(id, cognomFamiliar, idDomicili, estructuraFamiliar) {
    const [result] = await pool.query(
        `UPDATE Familia
        SET
            Cognom_familiar = ?,
            idDomicili = ?,
            Estructura_familiar = ?
        WHERE idFamilia = ?`,
        [cognomFamiliar, idDomicili, estructuraFamiliar, id]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM Familia WHERE idFamilia = ?`,
        [id]
    );
    return result.affectedRows;
}

async function existsByName(name) {
    const [rows] = await pool.query(
        `SELECT idFamilia, Cognom_familiar FROM Familia WHERE Cognom_familiar = ?`,
        [name]
    );
    return rows.length > 0 ? rows[0] : null;
}

async function searchByName(query) {
    const [rows] = await pool.query(
        `SELECT idFamilia, Cognom_familiar, Estructura_familiar
        FROM Familia
        WHERE Cognom_familiar LIKE ?
        ORDER BY Cognom_familiar
        LIMIT 20`,
        [`%${query}%`]
    );
    return rows;
}

module.exports = {
    getAll,
    getById,
    getByIdEnhanced,
    create,
    update,
    remove,
    searchByName,
    existsByName
};
