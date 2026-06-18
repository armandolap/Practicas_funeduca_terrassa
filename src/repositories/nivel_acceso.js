const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Nivel_acceso
        ORDER BY idNivel_acceso
    `);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM Nivel_acceso WHERE idNivel_acceso = ?`,
        [id]
    );
    return rows[0] || null;
}

module.exports = { getAll, getById };
