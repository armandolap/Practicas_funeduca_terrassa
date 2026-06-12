const { createPool } = require("../config/database");

const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM necessitats_especials
    ORDER BY Nom_necessitat
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM necessitats_especials
    WHERE idNecessitat_especial = ?
    `,
        [id]
    );

    return rows[0] || null;
}
async function create(nomNecessitat) {
    const [result] = await pool.query(
        `
        INSERT INTO necessitats_especials (Nom_necessitat)
        VALUES (?)
        `,
        [nomNecessitat]
    );

    return result.insertId;
}

async function update(id, nomNecessitat) {
    const [result] = await pool.query(
        `
        UPDATE necessitats_especials
        SET Nom_necessitat = ?
        WHERE idNecessitat_especial = ?
        `,
        [nomNecessitat, id]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `
        DELETE FROM necessitats_especials
        WHERE idNecessitat_especial = ?
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