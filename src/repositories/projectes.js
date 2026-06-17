const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT p.*, u.idUsuario_APP AS responsable
        FROM proyectos p
        LEFT JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN usuario_app u ON u.idUsuario_APP = r.idUsuario_APP
        ORDER BY p.Nom_projecte
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT p.*, u.idUsuario_APP AS responsable
        FROM proyectos p
        LEFT JOIN Responsables r ON r.proyectos_idProyecto = p.idProyecto
        LEFT JOIN usuario_app u ON u.idUsuario_APP = r.idUsuario_APP
        WHERE p.idProyecto = ?
        `,
        [id]
    );

    return rows[0] || null;
}

async function create(projecteData) {
    const {
        Nom_projecte,
        Descripcio,
        plazas = 0,
        inscritos = 0,
        fecha_inicio_act = null,
        fecha_fin_act = null,
        idcentre_activitats
    } = projecteData;

    const query = `
        INSERT INTO proyectos (
            Nom_projecte,
            Descripcio,
            plazas,
            inscritos,
            fecha_inicio_act,
            fecha_fin_act,
            idcentre_activitats
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        Nom_projecte,
        Descripcio,
        plazas,
        inscritos,
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
        inscritos = 0,
        fecha_inicio_act = null,
        fecha_fin_act = null,
        idcentre_activitats
    } = projecteData;

    const query = `
        UPDATE proyectos
        SET Nom_projecte = ?,
            Descripcio = ?,
            plazas = ?,
            inscritos = ?,
            fecha_inicio_act = ?,
            fecha_fin_act = ?,
            idcentre_activitats = ?
        WHERE idProyecto = ?
    `;

    const [result] = await pool.query(query, [
        Nom_projecte,
        Descripcio,
        plazas,
        inscritos,
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
    const [result] = await pool.query(
        `DELETE FROM proyectos WHERE idProyecto = ?`,
        [id]
    );
    return result.affectedRows;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    setResponsable
};