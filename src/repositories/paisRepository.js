const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM Pais
    ORDER BY Nom_pais
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM Pais
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