const { createPool } = require("../config/database");
const bcrypt = require("bcrypt");

const pool = createPool();

async function getAll(filter = "tots", q = "") {
    let sql = `
        SELECT u.*, na.Nom AS nivel_acceso_nom,
               (SELECT COUNT(*) FROM Responsables r
                JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
                WHERE r.idUsuario_APP = u.idUsuario_APP
                  AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS num_projectes_actius,
               (SELECT COUNT(*) FROM Responsables r WHERE r.idUsuario_APP = u.idUsuario_APP) AS num_projectes_total
        FROM usuario_app u
        JOIN Nivel_acceso na ON u.idNivel_acceso = na.idNivel_acceso
        WHERE 1=1
    `;
    const params = [];

    if (filter === "responsables") {
        sql += ` AND u.idNivel_acceso IN (1, 2, 3, 4)`;
    } else if (filter === "trabajadores") {
        sql += ` AND u.idNivel_acceso = 4`;
    }

    if (q && q.trim()) {
        sql += ` AND (u.Nom LIKE ? OR u.Cognoms LIKE ? OR u.username LIKE ? OR u.email LIKE ?)`;
        const like = `%${q.trim()}%`;
        params.push(like, like, like, like);
    }

    sql += ` ORDER BY num_projectes_actius DESC, u.Nom, u.Cognoms`;
    const [rows] = await pool.query(sql, params);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT u.*, na.Nom AS nivel_acceso_nom
        FROM usuario_app u
        JOIN Nivel_acceso na ON u.idNivel_acceso = na.idNivel_acceso
        WHERE u.idUsuario_APP = ?
    `, [id]);
    return rows[0] || null;
}

async function getProjectsByUser(id) {
    const [rows] = await pool.query(`
        SELECT p.*,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idProyecto = p.idProyecto) AS inscritos,
               CASE WHEN p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act <= CURDATE()
                     AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE()) THEN 'actiu'
                    WHEN p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act > CURDATE() THEN 'futur'
                    ELSE 'tancat' END AS estat_projecte
        FROM Responsables r
        JOIN proyectos p ON r.proyectos_idProyecto = p.idProyecto
        WHERE r.idUsuario_APP = ?
        ORDER BY p.fecha_inicio_act DESC
    `, [id]);
    return rows;
}

async function create(data) {
    const { idNivel_acceso, Nom, Cognoms, username, email, Telefon, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(`
        INSERT INTO usuario_app (idNivel_acceso, Nom, Cognoms, username, email, Telefon, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [idNivel_acceso, Nom, Cognoms, username, email || null, Telefon, hashedPassword]);
    return result.insertId;
}

async function update(id, data) {
    const { idNivel_acceso, Nom, Cognoms, username, email, Telefon, password } = data;
    let sql = `UPDATE usuario_app SET idNivel_acceso=?, Nom=?, Cognoms=?, username=?, email=?, Telefon=?`;
    const params = [idNivel_acceso, Nom, Cognoms, username, email || null, Telefon];
    if (password && password.trim()) {
        const hashed = await bcrypt.hash(password, 10);
        sql += `, password=?`;
        params.push(hashed);
    }
    sql += ` WHERE idUsuario_APP=?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    return result.affectedRows;
}

async function remove(id) {
    await pool.query(`DELETE FROM Responsables WHERE idUsuario_APP = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM usuario_app WHERE idUsuario_APP = ?`, [id]);
    return result.affectedRows;
}

async function findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM usuario_app WHERE email = ?`, [email]);
    return rows[0] || null;
}

async function findByUsername(username) {
    const [rows] = await pool.query(`SELECT * FROM usuario_app WHERE username = ?`, [username]);
    return rows[0] || null;
}

module.exports = { getAll, getById, getProjectsByUser, findByEmail, findByUsername, create, update, remove };
