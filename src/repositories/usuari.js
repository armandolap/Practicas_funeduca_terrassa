const { createPool } = require("../config/database");

const pool = createPool();

async function getAll({ filter, q } = {}) {
    let sql = `
        SELECT u.*, na.Nom AS rol,
               (SELECT COUNT(*) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_projectes_actius,
               (SELECT COUNT(*) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_projectes_oberts,
               (SELECT COUNT(DISTINCT phc.idClient) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                JOIN proyectos_has_client phc ON phc.idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_persones_en_projectes_actius
        FROM usuario_app u
        LEFT JOIN Nivel_acceso na ON u.idNivel_acceso = na.idNivel_acceso
        WHERE 1=1
    `;
    const params = [];

    if (filter === "responsables") {
        sql += ` AND u.idNivel_acceso IN (1, 2, 4)`;
    } else if (filter === "trabajadores") {
        sql += ` AND u.idNivel_acceso = 5`;
    }

    if (q && q.trim()) {
        sql += ` AND (u.Nom LIKE ? OR u.Cognoms LIKE ? OR u.email LIKE ?)`;
        const pattern = `%${q.trim()}%`;
        params.push(pattern, pattern, pattern);
    }

    sql += ` ORDER BY u.Nom, u.Cognoms`;

    const [rows] = await pool.query(sql, params);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT u.*, na.Nom AS rol,
               (SELECT COUNT(*) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_projectes_actius,
               (SELECT COUNT(*) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_projectes_oberts,
               (SELECT COUNT(DISTINCT phc.idClient) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                JOIN proyectos_has_client phc ON phc.idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_persones_en_projectes_actius
        FROM usuario_app u
        LEFT JOIN Nivel_acceso na ON u.idNivel_acceso = na.idNivel_acceso
        WHERE u.idUsuario_APP = ?
        `,
        [id]
    );

    const user = rows[0] || null;
    if (!user) return null;

    user.projectes = await getProjectsByUser(id);

    return user;
}

async function create(data) {
    const { idNivel_acceso, Nom, Cognoms, email, Telefon, password } = data;

    const [result] = await pool.query(
        `INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, email, Telefon, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idNivel_acceso, Nom, Cognoms, email, Telefon, password]
    );

    return result.insertId;
}

async function update(id, data) {
    const { Nom, Cognoms, email, Telefon, idNivel_acceso, password } = data;
    const fields = [];
    const values = [];

    if (Nom !== undefined) { fields.push("Nom=?"); values.push(Nom); }
    if (Cognoms !== undefined) { fields.push("Cognoms=?"); values.push(Cognoms); }
    if (email !== undefined) { fields.push("email=?"); values.push(email); }
    if (Telefon !== undefined) { fields.push("Telefon=?"); values.push(Telefon); }
    if (idNivel_acceso !== undefined) { fields.push("idNivel_acceso=?"); values.push(idNivel_acceso); }
    if (password) { fields.push("password=?"); values.push(password); }

    if (fields.length === 0) return 0;

    values.push(id);

    const [result] = await pool.query(
        `UPDATE usuario_app SET ${fields.join(", ")} WHERE idUsuario_APP=?`,
        values
    );

    return result.affectedRows;
}

async function remove(id) {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM Responsables WHERE idUsuario_APP = ?`,
        [id]
    );

    if (rows[0].cnt > 0) return false;

    const [result] = await pool.query(
        `DELETE FROM usuario_app WHERE idUsuario_APP = ?`,
        [id]
    );

    return result.affectedRows > 0;
}

async function getProjectsByUser(id) {
    const [rows] = await pool.query(
        `
        SELECT p.*, ca.nom_centre_activitats,
               (SELECT COUNT(*) FROM proyectos_has_client WHERE idProyecto = p.idProyecto) AS inscritos,
               CASE
                   WHEN p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE() THEN 'actiu'
                   ELSE 'finalitzat'
               END AS estat
        FROM proyectos p
        JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        WHERE r.idUsuario_APP = ?
        ORDER BY p.idProyecto DESC
        `,
        [id]
    );

    return rows;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getProjectsByUser
};
