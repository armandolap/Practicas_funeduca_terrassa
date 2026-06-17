const { createPool } = require("../config/database");

const pool = createPool();

async function findUserByEmail(email) {
    const [rows] = await pool.query(
        `SELECT * FROM usuario_app WHERE email = ?`,
        [email]
    );
    return rows[0] || null;
}

async function getUserById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM usuario_app WHERE idUsuario_APP = ?`,
        [id]
    );
    return rows[0] || null;
}

module.exports = { findUserByEmail, getUserById };
