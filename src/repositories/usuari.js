const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Usuario_APP
        ORDER BY idUsuario_APP
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT *
        FROM Usuario_APP
        WHERE idUsuario_APP = ?
    `, [id]);

    return rows[0];
}

async function create(rol_usuario) {
    const [result] = await pool.query(`
        INSERT INTO Usuario_APP (Rol_usuario)
        VALUES (?)
    `, [rol_usuario]);

    return result.insertId;
}

async function update(id, rol_usuario) {
    const [result] = await pool.query(`
        UPDATE Usuario_APP
        SET Rol_usuario = ?
        WHERE idUsuario_APP = ?
    `, [rol_usuario, id]);

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(`
        DELETE FROM Usuario_APP
        WHERE idUsuario_APP = ?
    `, [id]);

    return result.affectedRows;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};