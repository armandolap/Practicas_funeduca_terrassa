const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM situacio_economica
    ORDER BY Nom
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM situacio_economica
    WHERE idSituacio_economica = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};