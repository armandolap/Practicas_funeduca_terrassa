const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM usuario_app
        ORDER BY Nom, Cognoms
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT *
        FROM usuario_app
        WHERE idUsuario_APP = ?
    `, [id]);

    return rows[0] || null;
}

async function create(data) {

    const {
        idNivel_acceso,
        Nom,
        Cognoms,
        email,
        Telefon
    } = data;

    const [result] = await pool.query(`
        INSERT INTO usuario_app
        (
            idNivel_acceso,
            Nom,
            Cognoms,
            email,
            Telefon
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        idNivel_acceso,
        Nom,
        Cognoms,
        email,
        Telefon
    ]);

    return result.insertId;
}

async function update(id, data) {

    const {
        idNivel_acceso,
        Nom,
        Cognoms,
        email,
        Telefon
    } = data;

    const [result] = await pool.query(`
        UPDATE usuario_app
        SET
            idNivel_acceso=?,
            Nom=?,
            Cognoms=?,
            email=?,
            Telefon=?
        WHERE idUsuario_APP=?
    `, [
        idNivel_acceso,
        Nom,
        Cognoms,
        email,
        Telefon,
        id
    ]);

    return result.affectedRows;
}

async function remove(id) {

    const [result] = await pool.query(`
        DELETE FROM usuario_app
        WHERE idUsuario_APP=?
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