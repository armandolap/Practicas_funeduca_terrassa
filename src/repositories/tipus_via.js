const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM tipus_via
        ORDER BY Nom
    `);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM tipus_via WHERE idTipus_via = ?`,
        [id]
    );
    return rows[0] || null;
}

async function create(nom) {
    const [result] = await pool.query(
        `INSERT INTO tipus_via (Nom) VALUES (?)`,
        [nom]
    );
    return result.insertId;
}

async function update(id, nom) {
    const [result] = await pool.query(
        `UPDATE tipus_via SET Nom = ? WHERE idTipus_via = ?`,
        [nom, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM tipus_via WHERE idTipus_via = ?`,
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
