const { createPool } = require("../config/database");
const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT ca.*,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               (SELECT COUNT(*) FROM proyectos p WHERE p.idcentre_activitats = ca.idcentre_activitats) AS num_projectes
        FROM centre_activitats ca
        JOIN direccio dir ON ca.direccio_idDireccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        ORDER BY ca.nom_centre_activitats
    `);
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(`
        SELECT ca.*,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               (SELECT COUNT(*) FROM proyectos p WHERE p.idcentre_activitats = ca.idcentre_activitats) AS num_projectes
        FROM centre_activitats ca
        JOIN direccio dir ON ca.direccio_idDireccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        WHERE ca.idcentre_activitats = ?
    `, [id]);
    return rows[0] || null;
}

async function search({ q }) {
    let sql = `
        SELECT ca.*,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.idTipus_via, tv.Nom AS tipus_via,
               b.idBarri, b.Nom AS barri,
               cp.idCodi_postal, cp.Codi AS codi_postal,
               (SELECT COUNT(*) FROM proyectos p WHERE p.idcentre_activitats = ca.idcentre_activitats) AS num_projectes
        FROM centre_activitats ca
        JOIN direccio dir ON ca.direccio_idDireccio = dir.idDireccio
        JOIN callejero c ON dir.idcallejero = c.idcallejero
        JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        JOIN barri b ON c.idBarri = b.idBarri
        JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
    `;
    const params = [];
    if (q && q.trim()) {
        sql += ` WHERE ca.nom_centre_activitats LIKE ? OR c.Nom_calle LIKE ? OR CONCAT(tv.Nom, ' ', c.Nom_calle) LIKE ?`;
        const like = `%${q.trim()}%`;
        params.push(like, like, like);
    }
    sql += ` ORDER BY ca.nom_centre_activitats LIMIT 20`;
    const [rows] = await pool.query(sql, params);
    return rows;
}

async function create(data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { nom_centre_activitats, direccio } = data;
        let idDireccio = direccio?.idDireccio || null;
        if (!idDireccio && direccio?.idcallejero) {
            const [rDir] = await conn.query(
                `INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (?, ?, ?, ?)`,
                [direccio.idcallejero, direccio.Num_calle || '', direccio.Pis || null, direccio.Escala || null]
            );
            idDireccio = rDir.insertId;
        }
        if (!idDireccio) throw new Error("Cal una direcció per al centre d'activitats");
        const [result] = await conn.query(
            `INSERT INTO centre_activitats (nom_centre_activitats, direccio_idDireccio) VALUES (?, ?)`,
            [nom_centre_activitats, idDireccio]
        );
        await conn.commit();
        return result.insertId;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

async function update(id, data) {
    const { nom_centre_activitats } = data;
    const [result] = await pool.query(
        `UPDATE centre_activitats SET nom_centre_activitats = ? WHERE idcentre_activitats = ?`,
        [nom_centre_activitats, id]
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

module.exports = { getAll, getById, search, create, update, remove };
