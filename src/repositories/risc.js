const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM risc
    ORDER BY Nivel
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM risc
    WHERE idRisc = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};