const { createPool } = require("../config/database");

const pool = createPool();

const JOIN_SQL = `
    centre_activitats ca
    JOIN direccio dir ON ca.direccio_idDireccio = dir.idDireccio
    JOIN callejero c ON dir.idcallejero = c.idcallejero
    JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
    JOIN barri b ON c.idBarri = b.idBarri
    JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
`;

const COLUMNS = `
    ca.*,
    dir.idDireccio,
    dir.Num_calle,
    dir.Pis,
    dir.Escala,
    c.Nom_calle,
    tv.Nom AS tipus_via_nom,
    b.Nom AS barri_nom,
    cp.Codi AS codi_postal_val
`;

async function getAll() {
    const [rows] = await pool.query(`
        SELECT ${COLUMNS}
        FROM ${JOIN_SQL}
        ORDER BY ca.nom_centre_activitats
    `);
    return rows;
}

async function search({ q, idcallejero, nom_carrer }) {
    let where = [];
    let params = [];

    if (q) {
        where.push("ca.nom_centre_activitats LIKE ?");
        params.push(`%${q}%`);
    }

    if (idcallejero) {
        where.push("dir.idcallejero = ?");
        params.push(idcallejero);
    }

    if (nom_carrer) {
        where.push("c.Nom_calle LIKE ?");
        params.push(`%${nom_carrer}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(`
        SELECT ${COLUMNS}
        FROM ${JOIN_SQL}
        ${whereClause}
        ORDER BY ca.nom_centre_activitats
    `, params);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT ${COLUMNS}
        FROM ${JOIN_SQL}
        WHERE ca.idcentre_activitats = ?
    `, [id]);

    return rows[0] || null;
}

async function create({ nom_centre_activitats, direccio_idDireccio }) {
    const [result] = await pool.query(
        `INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES (?, ?)`,
        [nom_centre_activitats, direccio_idDireccio]
    );
    return result.insertId;
}

async function update(id, { nom_centre_activitats, direccio_idDireccio }) {
    const [result] = await pool.query(
        `UPDATE centre_activitats SET nom_centre_activitats = ?, direccio_idDireccio = ? WHERE idcentre_activitats = ?`,
        [nom_centre_activitats, direccio_idDireccio, id]
    );
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM centre_activitats WHERE idcentre_activitats = ?`,
        [id]
    );
    return result.affectedRows;
}

module.exports = { getAll, search, getById, create, update, remove };
