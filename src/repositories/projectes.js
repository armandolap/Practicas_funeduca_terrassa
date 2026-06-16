const { createPool } = require("../config/database");

const pool = createPool();
// aqui va la peticion al server SQL 
// FALTEN PUT i POST per editar i crear

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM proyectos
        ORDER BY Nom_projecte
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM proyectos
        WHERE idProyecto = ?
        `,
        [id]
    );

    return rows[0] || null;
}

async function create(projecteData) {
    // Desestructuramos para mayor claridad y asignamos valores por defecto de BBDD si es necesario
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

module.exports = {
    getAll,
    getById,
    create
};