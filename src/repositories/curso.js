const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM Curs_actual
    ORDER BY idCurs_actual
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM Curs_actual
    WHERE idCurs_actual = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};