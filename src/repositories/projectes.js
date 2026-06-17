const { createPool } = require("../config/database");
const pool = createPool();

async function getAll(filter = "todos", q = "", responsable_id) {
    let sql = `
        SELECT p.*,
               u.idUsuario_APP AS responsable,
               u.Nom AS responsable_nom,
               u.Cognoms AS responsable_cognoms,
               u.Telefon AS responsable_telefon,
               u.email AS responsable_email,
               ca.nom_centre_activitats,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idProyecto = p.idProyecto) AS inscritos
        FROM proyectos p
        LEFT JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN usuario_app u ON u.idUsuario_APP = r.idUsuario_APP
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        WHERE 1=1
    `;
    const params = [];

    if (responsable_id) {
        sql += ` AND r.idUsuario_APP = ?`;
        params.push(responsable_id);
    }

    if (filter === "activos") {
        sql += ` AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                 AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())`;
    } else if (filter === "futuros") {
        sql += ` AND p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act > CURDATE()`;
    } else if (filter === "pasados") {
        sql += ` AND p.fecha_fin_act IS NOT NULL AND p.fecha_fin_act < CURDATE()`;
    }

    if (q && q.trim()) {
        sql += ` AND p.Nom_projecte LIKE ?`;
        params.push(`%${q.trim()}%`);
    }

    sql += ` ORDER BY p.idProyecto DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT p.*,
               u.idUsuario_APP AS responsable,
               u.Nom AS responsable_nom,
               u.Cognoms AS responsable_cognoms,
               u.Telefon AS responsable_telefon,
               u.email AS responsable_email,
               ca.nom_centre_activitats,
               ca.idcentre_activitats,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idProyecto = p.idProyecto) AS inscritos
        FROM proyectos p
        LEFT JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN usuario_app u ON u.idUsuario_APP = r.idUsuario_APP
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        LEFT JOIN direccio dir ON ca.direccio_idDireccio = dir.idDireccio
        LEFT JOIN callejero c ON dir.idcallejero = c.idcallejero
        LEFT JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        LEFT JOIN barri b ON c.idBarri = b.idBarri
        LEFT JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE p.idProyecto = ?
    `, [id]);
    return rows[0] || null;
}

async function getParticipants(projectId) {
    const [rows] = await pool.query(`
        SELECT cl.idClient, cl.Nom, cl.Cognoms, cl.Fecha_nacimiento, cl.C_edad,
               f.idFamilia, f.Cognom_familiar
        FROM proyectos_has_client phc
        JOIN client cl ON phc.idClient = cl.idClient
        JOIN familia f ON cl.idFamilia = f.idFamilia
        WHERE phc.idProyecto = ?
        ORDER BY cl.Cognoms, cl.Nom
    `, [projectId]);
    return rows;
}

async function create(projecteData) {
    const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats } = projecteData;
    const [result] = await pool.query(`
        INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats)
        VALUES (?, ?, ?, 0, ?, ?, ?)
    `, [Nom_projecte, Descripcio || null, plazas || 0, fecha_inicio_act || null, fecha_fin_act || null, idcentre_activitats]);
    return result.insertId;
}

async function update(id, projecteData) {
    const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats } = projecteData;
    const [result] = await pool.query(`
        UPDATE proyectos SET Nom_projecte = ?, Descripcio = ?, plazas = ?, fecha_inicio_act = ?, fecha_fin_act = ?, idcentre_activitats = ?
        WHERE idProyecto = ?
    `, [Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, id]);
    return result.affectedRows;
}

async function setResponsable(projectId, usuarioId) {
    await pool.query(`DELETE FROM Responsables WHERE proyectos_idProyecto = ?`, [projectId]);
    if (usuarioId) {
        await pool.query(`INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP) VALUES (?, ?)`, [projectId, usuarioId]);
    }
}

async function remove(id) {
    await pool.query(`DELETE FROM Responsables WHERE proyectos_idProyecto = ?`, [id]);
    await pool.query(`DELETE FROM proyectos_has_client WHERE idProyecto = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM proyectos WHERE idProyecto = ?`, [id]);
    return result.affectedRows;
}

async function addClients(projectId, clientIds) {
    if (!clientIds || clientIds.length === 0) return 0;
    const values = clientIds.map(cid => [projectId, cid]);
    const [result] = await pool.query(
        `INSERT IGNORE INTO proyectos_has_client (idProyecto, idClient) VALUES ?`,
        [values]
    );
    return result.affectedRows;
}

async function removeClient(projectId, clientId) {
    const [result] = await pool.query(
        `DELETE FROM proyectos_has_client WHERE idProyecto = ? AND idClient = ?`,
        [projectId, clientId]
    );
    return result.affectedRows;
}

module.exports = { getAll, getById, getParticipants, create, update, setResponsable, remove, addClients, removeClient };
