const pool = require("../config/database");
// aqui v ala peticion al server SQL 

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM Proyectos
    ORDER BY Nom_projecte
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM Proyectos
    WHERE idProyecto = ?
    `,
        [id]
    );

    return rows[0] || null;
}




module.exports = {
    getAll,
    getById
};