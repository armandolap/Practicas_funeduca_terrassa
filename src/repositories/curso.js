const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM curs_actual
    ORDER BY idcurs_actual
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM curs_actual
    WHERE idcurs_actual = ?
    `,
        [id]
    );

    return rows[0] || null;
}

async function create(nom) {
    const [result] = await pool.query(
        `
        INSERT INTO curs_actual (Nom)
        VALUES (?)
        `,
        [nom]
    );

    return result.insertId;
}
async function update(id, nom) {
    const [result] = await pool.query(
        `
        UPDATE curs_actual
        SET Nom = ?
        WHERE idcurs_actual = ?
        `,
        [nom, id]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `
        DELETE FROM curs_actual
        WHERE idcurs_actual = ?
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