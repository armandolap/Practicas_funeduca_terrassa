const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM barri
        ORDER BY Nom
    `);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM barri WHERE idBarri = ?`,
        [id]
    );
    return rows[0] || null;
}

async function create(nom) {
    const [result] = await pool.query(
        `INSERT INTO barri (Nom) VALUES (?)`,
        [nom]
    );
    return result.insertId;
}

async function update(id, nom) {
    const [result] = await pool.query(
        `UPDATE barri SET Nom = ? WHERE idBarri = ?`,
        [nom, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM barri WHERE idBarri = ?`,
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
