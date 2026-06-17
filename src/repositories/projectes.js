const { createPool } = require("../config/database");

const pool = createPool();

async function getAll({ filter, q } = {}) {
    let sql = `
        SELECT p.*, u.idUsuario_APP AS responsable, ca.nom_centre_activitats,
               (SELECT COUNT(*) FROM proyectos_has_client WHERE idProyecto = p.idProyecto) AS inscritos
        FROM proyectos p
        LEFT JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN usuario_app u ON u.idUsuario_APP = r.idUsuario_APP
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        WHERE 1=1
    `;
    const params = [];

    if (filter === "activos") {
        sql += ` AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                 AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())`;
    } else if (filter === "pasados") {
        sql += ` AND p.fecha_fin_act < CURDATE()`;
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
    const [rows] = await pool.query(
        `
        SELECT p.*,
               u.idUsuario_APP AS responsable_id,
               u.Nom AS responsable_Nom,
               u.Cognoms AS responsable_Cognoms,
               u.Telefon AS responsable_Telefon,
               u.email AS responsable_email,
               ca.nom_centre_activitats,
               ca.idcentre_activitats,
               d.Num_calle, d.Pis, d.Escala,
               c.Nom_calle,
               tv.Nom AS tipus_via,
               b.Nom AS barri,
               cp.Codi AS codi_postal,
               (SELECT COUNT(*) FROM proyectos_has_client WHERE idProyecto = p.idProyecto) AS inscritos
        FROM proyectos p
        LEFT JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN usuario_app u ON u.idUsuario_APP = r.idUsuario_APP
        LEFT JOIN centre_activitats ca ON p.idcentre_activitats = ca.idcentre_activitats
        LEFT JOIN direccio d ON ca.direccio_idDireccio = d.idDireccio
        LEFT JOIN callejero c ON d.idcallejero = c.idcallejero
        LEFT JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        LEFT JOIN barri b ON c.idBarri = b.idBarri
        LEFT JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE p.idProyecto = ?
        `,
        [id]
    );

    const projecte = rows[0] || null;
    if (!projecte) return null;

    const [clients] = await pool.query(
        `
        SELECT cl.idClient, cl.Nom, cl.Cognoms, f.idFamilia, f.Cognom_familiar
        FROM proyectos_has_client phc
        JOIN client cl ON phc.idClient = cl.idClient
        JOIN familia f ON cl.idFamilia = f.idFamilia
        WHERE phc.idProyecto = ?
        `,
        [id]
    );

    projecte.clients = clients;

    return projecte;
}

async function create(projecteData) {
    const {
        Nom_projecte,
        Descripcio,
        plazas = 0,
        fecha_inicio_act = null,
        fecha_fin_act = null,
        idcentre_activitats
    } = projecteData;

    const query = `
        INSERT INTO proyectos (
            Nom_projecte,
            Descripcio,
            plazas,
            fecha_inicio_act,
            fecha_fin_act,
            idcentre_activitats
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        Nom_projecte,
        Descripcio,
        plazas,
        fecha_inicio_act,
        fecha_fin_act,
        idcentre_activitats
    ];

    const [result] = await pool.query(query, values);
    return result.insertId;
}

async function update(id, projecteData) {
    const {
        Nom_projecte,
        Descripcio,
        plazas = 0,
        fecha_inicio_act = null,
        fecha_fin_act = null,
        idcentre_activitats
    } = projecteData;

    const query = `
        UPDATE proyectos
        SET Nom_projecte = ?,
            Descripcio = ?,
            plazas = ?,
            fecha_inicio_act = ?,
            fecha_fin_act = ?,
            idcentre_activitats = ?
        WHERE idProyecto = ?
    `;

    const [result] = await pool.query(query, [
        Nom_projecte,
        Descripcio,
        plazas,
        fecha_inicio_act,
        fecha_fin_act,
        idcentre_activitats,
        id
    ]);

    return result.affectedRows;
}

async function setResponsable(projectId, usuarioId) {
    await pool.query(
        `DELETE FROM Responsables WHERE proyectos_idProyecto = ?`,
        [projectId]
    );
    if (usuarioId) {
        await pool.query(
            `INSERT INTO Responsables (proyectos_idProyecto, idUsuario_APP) VALUES (?, ?)`,
            [projectId, usuarioId]
        );
    }
}

async function remove(id) {
    await pool.query(
        `DELETE FROM Responsables WHERE proyectos_idProyecto = ?`,
        [id]
    );
    await pool.query(
        `DELETE FROM proyectos_has_client WHERE idProyecto = ?`,
        [id]
    );
    const [result] = await pool.query(
        `DELETE FROM proyectos WHERE idProyecto = ?`,
        [id]
    );
    return result.affectedRows;
}

async function addClients(projectId, clientIds) {
    const values = clientIds.map(clientId => [projectId, clientId]);
    if (values.length === 0) return;
    const placeholders = values.map(() => "(?, ?)").join(", ");
    await pool.query(
        `INSERT IGNORE INTO proyectos_has_client (idProyecto, idClient) VALUES ${placeholders}`,
        values.flat()
    );
}

async function removeClient(projectId, clientId) {
    await pool.query(
        `DELETE FROM proyectos_has_client WHERE idProyecto = ? AND idClient = ?`,
        [projectId, clientId]
    );
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    setResponsable,
    addClients,
    removeClient
};
