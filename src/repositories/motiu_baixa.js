const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM motiu_baixa
    ORDER BY Nom_motiu_baixa
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM motiu_baixa
    WHERE idMotiu_baixa = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};