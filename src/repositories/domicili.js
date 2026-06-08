const pool = require("../config/database");

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Domicili
        ORDER BY idDomicili
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM Domicili
        WHERE idDomicili = ?
        `,
        [id]
    );

    return rows[0] || null;
}

async function create(idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `
        INSERT INTO Domicili
        (Tipus_domicili, Direccio)
        VALUES (?, ?)
        `,
        [idTipusDomicili, direccio]
    );

    return result.insertId;
}

async function update(id, idTipusDomicili, direccio) {
    const [result] = await pool.query(
        `
        UPDATE Domicili
        SET
            Tipus_domicili = ?,
            Direccio = ?
        WHERE idDomicili = ?
        `,
        [idTipusDomicili, direccio, id]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `
        DELETE FROM Domicili
        WHERE idDomicili = ?
        `,
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