const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Familia
        ORDER BY Cognom_familiar
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM Familia
        WHERE idFamilia = ?
        `,
        [id]
    );

    return rows[0] || null;
}

async function create(cognomFamiliar, idDomicili, estructuraFamiliar) {
    const [result] = await pool.query(
        `
        INSERT INTO Familia (
            Cognom_familiar,
            idDomicili,
            Estructura_familiar
        )
        VALUES (?, ?, ?)
        `,
        [cognomFamiliar, idDomicili, estructuraFamiliar]
    );

    return result.insertId;
}

async function update(
    id,
    cognomFamiliar,
    idDomicili,
    estructuraFamiliar
) {
    const [result] = await pool.query(
        `
        UPDATE Familia
        SET
            Cognom_familiar = ?,
            idDomicili = ?,
            Estructura_familiar = ?
        WHERE idFamilia = ?
        `,
        [
            cognomFamiliar,
            idDomicili,
            estructuraFamiliar,
            id
        ]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `
        DELETE FROM Familia
        WHERE idFamilia = ?
        `,
        [id]
    );

    return result.affectedRows;
}

async function existsByName(name) {
    const [rows] = await pool.query(
        `SELECT idFamilia, Cognom_familiar FROM Familia WHERE Cognom_familiar = ?`,
        [name]
    );
    return rows.length > 0 ? rows[0] : null;
}

async function searchByName(query) {
    const [rows] = await pool.query(
        `
        SELECT idFamilia, Cognom_familiar, Estructura_familiar
        FROM Familia
        WHERE Cognom_familiar LIKE ?
        ORDER BY Cognom_familiar
        LIMIT 20
        `,
        [`%${query}%`]
    );
    return rows;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    searchByName
};