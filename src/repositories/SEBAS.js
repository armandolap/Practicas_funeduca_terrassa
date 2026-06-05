const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM sebas
    ORDER BY Nom
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM sebas
    WHERE idSebas = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};