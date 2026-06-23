const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM curs_lectiu
    ORDER BY Nom_curs_lectiu
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM curs_lectiu
    WHERE idCurs_lectiu = ?
    `,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};
