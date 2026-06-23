const { createPool } = require("../config/database");
const pool = createPool();

async function getAll(filter = "todos", q = "", responsable_id, idCentre) {
    let sql = `
        SELECT p.*,
               ca.nom_centre_activitats,
               cl.Nom_curs_lectiu,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idProyecto = p.idProyecto) AS inscritos,
               (SELECT GROUP_CONCAT(
                            CONCAT_WS('\x1f', r.idUsuario_APP, ru.Nom, ru.Cognoms, r.tipus_responsable)
                            ORDER BY r.tipus_responsable, ru.Nom SEPARATOR '\x1e')
                FROM Responsables r
                JOIN usuario_app ru ON ru.idUsuario_APP = r.idUsuario_APP
                WHERE r.proyectos_idProyecto = p.idProyecto) AS responsables
        FROM proyectos p
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        LEFT JOIN curs_lectiu cl ON p.idCurs_lectiu = cl.idCurs_lectiu
        WHERE 1=1
    `;
    const params = [];

    if (idCentre) {
        sql += ` AND p.idcentre_activitats = ?`;
        params.push(idCentre);
    }

    if (responsable_id) {
        sql += ` AND p.idProyecto IN (
            SELECT r2.proyectos_idProyecto FROM Responsables r2
            WHERE r2.idUsuario_APP = ? AND r2.tipus_responsable IN (1, 2)
        )`;
        params.push(responsable_id);
    }

    if (filter === "activos") {
        sql += ` AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                 AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())`;
    } else if (filter === "futuros") {
        sql += ` AND p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act > CURDATE()`;
    } else if (filter === "pasados") {
        sql += ` AND p.fecha_fin_act IS NOT NULL AND p.fecha_fin_act < CURDATE()`;
    } else if (filter === "actiu_futur") {
        sql += ` AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())`;
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
               ca.nom_centre_activitats,
               ca.idcentre_activitats,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               cl.Nom_curs_lectiu,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idProyecto = p.idProyecto) AS inscritos
        FROM proyectos p
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        LEFT JOIN curs_lectiu cl ON p.idCurs_lectiu = cl.idCurs_lectiu
        LEFT JOIN direccio dir ON ca.direccio_idDireccio = dir.idDireccio
        LEFT JOIN callejero c ON dir.idcallejero = c.idcallejero
        LEFT JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        LEFT JOIN barri b ON c.idBarri = b.idBarri
        LEFT JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE p.idProyecto = ?
    `, [id]);
    return rows[0] || null;
}

async function getResponsables(projectId) {
    const [rows] = await pool.query(`
        SELECT r.tipus_responsable, r.idUsuario_APP,
               u.Nom, u.Cognoms, u.idNivel_acceso, na.Nom AS nivell_nom
        FROM Responsables r
        JOIN usuario_app u ON r.idUsuario_APP = u.idUsuario_APP
        JOIN Nivel_acceso na ON u.idNivel_acceso = na.idNivel_acceso
        WHERE r.proyectos_idProyecto = ?
        ORDER BY r.tipus_responsable, u.Nom
    `, [projectId]);
    return rows;
}

async function getUsuarisByNivell(minLevel, maxLevel) {
    const [rows] = await pool.query(`
        SELECT u.idUsuario_APP, u.Nom, u.Cognoms, u.idNivel_acceso, na.Nom AS nivell_nom
        FROM usuario_app u
        JOIN Nivel_acceso na ON u.idNivel_acceso = na.idNivel_acceso
        WHERE u.idNivel_acceso BETWEEN ? AND ?
        ORDER BY u.Nom, u.Cognoms
    `, [minLevel, maxLevel]);
    return rows;
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
    const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, idCurs_lectiu } = projecteData;
    const [result] = await pool.query(`
        INSERT INTO proyectos (Nom_projecte, Descripcio, plazas, inscritos, fecha_inicio_act, fecha_fin_act, idcentre_activitats, idCurs_lectiu)
        VALUES (?, ?, ?, 0, ?, ?, ?, ?)
    `, [Nom_projecte, Descripcio || null, plazas || 0, fecha_inicio_act || null, fecha_fin_act || null, idcentre_activitats, idCurs_lectiu || null]);
    return result.insertId;
}

async function update(id, projecteData) {
    const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, idCurs_lectiu } = projecteData;
    const [result] = await pool.query(`
        UPDATE proyectos SET Nom_projecte = ?, Descripcio = ?, plazas = ?, fecha_inicio_act = ?, fecha_fin_act = ?, idcentre_activitats = ?, idCurs_lectiu = ?
        WHERE idProyecto = ?
    `, [Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, idCurs_lectiu || null, id]);
    return result.affectedRows;
}

async function syncResponsables(projectId, responsableZona, responsablesProjecte, treballadors) {
    await pool.query(`DELETE FROM Responsables WHERE proyectos_idProyecto = ?`, [projectId]);

    if (responsableZona) {
        await pool.query(`INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP, tipus_responsable) VALUES (?, ?, 1)`,
            [projectId, responsableZona]);
    }
    if (responsablesProjecte && responsablesProjecte.length) {
        const values = responsablesProjecte.map(uId => [projectId, uId, 2]);
        await pool.query(`INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP, tipus_responsable) VALUES ?`, [values]);
    }
    if (treballadors && treballadors.length) {
        const values = treballadors.map(uId => [projectId, uId, 3]);
        await pool.query(`INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP, tipus_responsable) VALUES ?`, [values]);
    }
}

async function addResponsables(projectId, responsablesProjecte, treballadors) {
    if (responsablesProjecte && responsablesProjecte.length) {
        const values = responsablesProjecte.map(uId => [projectId, uId, 2]);
        await pool.query(`INSERT IGNORE INTO Responsables (proyectos_idProyecto, idUsuario_APP, tipus_responsable) VALUES ?`, [values]);
    }
    if (treballadors && treballadors.length) {
        const values = treballadors.map(uId => [projectId, uId, 3]);
        await pool.query(`INSERT IGNORE INTO Responsables (proyectos_idProyecto, idUsuario_APP, tipus_responsable) VALUES ?`, [values]);
    }
}

async function remove(id) {
    await pool.query(`DELETE FROM Responsables WHERE proyectos_idProyecto = ?`, [id]);
    await pool.query(`DELETE FROM proyectos_has_client WHERE idProyecto = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM proyectos WHERE idProyecto = ?`, [id]);
    return result.affectedRows;
}

async function validateClientIds(clientIds) {
    if (!clientIds || clientIds.length === 0) return [];
    const [rows] = await pool.query(
        `SELECT idClient FROM client WHERE idClient IN (?)`,
        [clientIds]
    );
    const existing = new Set(rows.map(r => r.idClient));
    return clientIds.filter(id => !existing.has(id));
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

module.exports = { getAll, getById, getResponsables, getUsuarisByNivell, getParticipants, create, update, syncResponsables, addResponsables, remove, addClients, removeClient, validateClientIds };
