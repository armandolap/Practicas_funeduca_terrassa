const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Genere
        ORDER BY Nom_genere
    `);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM Genere
        WHERE idGenere = ?
        `,
        [id]
    );
    return rows[0] || null;
}

module.exports = {
    getAll,
    getById
};
