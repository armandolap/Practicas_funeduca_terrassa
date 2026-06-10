const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM codi_postal
        ORDER BY Codi
    `);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM codi_postal WHERE idCodi_postal = ?`,
        [id]
    );
    return rows[0] || null;
}

async function create(codi) {
    const [result] = await pool.query(
        `INSERT INTO codi_postal (Codi) VALUES (?)`,
        [codi]
    );
    return result.insertId;
}

async function update(id, codi) {
    const [result] = await pool.query(
        `UPDATE codi_postal SET Codi = ? WHERE idCodi_postal = ?`,
        [codi, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM codi_postal WHERE idCodi_postal = ?`,
        [id]
    );
    return result.affectedRows;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
