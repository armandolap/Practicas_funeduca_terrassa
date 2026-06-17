const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM pais
    ORDER BY Nom_pais
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM pais
    WHERE idPais = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};