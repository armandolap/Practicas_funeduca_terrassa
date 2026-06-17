const { createPool } = require("../config/database");

const pool = createPool();

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

async function getByFamily(idFamilia) {
    const [rows] = await pool.query(
        `
        SELECT DISTINCT
            d.idDomicili,
            d.Tipus_domicili,
            td.Nom_domicili,
            dir.idDireccio,
            dir.Num_calle,
            dir.Pis,
            dir.Escala,
            c.idcallejero,
            c.Nom_calle,
            tv.idTipus_via,
            tv.Nom AS tipus_via_nom,
            b.idBarri,
            b.Nom AS barri_nom,
            cp.idCodi_postal,
            cp.Codi AS codi_postal
        FROM Client cl
        JOIN Domicili d ON cl.idDomicili = d.idDomicili
        JOIN tipus_domicili td ON d.Tipus_domicili = td.idTipus_domicili
        JOIN direccio dir ON d.Direccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE cl.idFamilia = ?
        ORDER BY d.idDomicili
        `,
        [idFamilia]
    );
    return rows;
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getByFamily
};