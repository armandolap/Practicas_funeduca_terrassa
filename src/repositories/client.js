const { createPool } = require("../config/database");

const pool = createPool();

function calcTempsEntitat(altaDateStr) {
    const alta = new Date(altaDateStr);
    const avui = new Date();
    let anys = avui.getFullYear() - alta.getFullYear();
    let mesos = avui.getMonth() - alta.getMonth();
    if (mesos < 0) { anys--; mesos += 12; }
    if (anys > 0) return anys === 1 ? "1 any" : `${anys} anys`;
    if (mesos > 0) return mesos === 1 ? "1 mes" : `${mesos} mesos`;
    return "0";
}

async function getAll(filters = {}) {
    const { q, familia, genere, barri, edatMin, edatMax } = filters;
    const params = [];
    const conditions = [];
    const extraJoins = [];

    if (q && q.trim()) {
        conditions.push(`(c.Nom LIKE ? OR c.Cognoms LIKE ?)`);
        params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }
    if (familia) {
        conditions.push(`c.idFamilia = ?`);
        params.push(familia);
    }
    if (genere) {
        conditions.push(`c.idGenere = ?`);
        params.push(genere);
    }
    if (barri) {
        extraJoins.push(`JOIN Domicili d ON c.idDomicili = d.idDomicili`);
        extraJoins.push(`JOIN Direccio dir ON d.Direccio = dir.idDireccio`);
        extraJoins.push(`JOIN callejero cal ON dir.idcallejero = cal.idcallejero`);
        conditions.push(`cal.idBarri = ?`);
        params.push(barri);
    }
    if (edatMin && edatMax) {
        conditions.push(`TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) BETWEEN ? AND ?`);
        params.push(edatMin, edatMax);
    } else if (edatMin) {
        conditions.push(`TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) >= ?`);
        params.push(edatMin);
    } else if (edatMax) {
        conditions.push(`TIMESTAMPDIFF(YEAR, c.Fecha_nacimiento, CURDATE()) <= ?`);
        params.push(edatMax);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(`
        SELECT c.idClient, c.Nom, c.Cognoms, c.C_edad,
               f.Cognom_familiar,
               GROUP_CONCAT(DISTINCT p.Nom_projecte) AS projectes
        FROM Client c
        JOIN Familia f ON c.idFamilia = f.idFamilia
        JOIN Genere g ON c.idGenere = g.idGenere
        LEFT JOIN proyectos_has_client phc ON c.idClient = phc.idClient
        LEFT JOIN Proyectos p ON phc.idProyecto = p.idProyecto
        ${extraJoins.join(" ")}
        ${whereClause}
        GROUP BY c.idClient, c.Nom, c.Cognoms, c.C_edad, f.Cognom_familiar
        ORDER BY c.Cognoms, c.Nom
        LIMIT 50
    `, params);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM Client WHERE idClient = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getByIdEnhanced(id) {
    const [clientRows] = await pool.query(`
        SELECT c.*,
               g.Nom_genere,
               r.Nom_rol,
               ris.Nivel AS risc_nom,
               ra.Nom_resultat_acad,
               se.Nom AS sit_eco_nom,
               seb.Nom AS sebas_nom,
               ne.Nom_necessitat,
               ca.Nom AS curs_nom,
               p.Nom_pais AS pais_naixement_nom,
               f.Cognom_familiar,
               f.idFamilia,
               ef.Nom_est_fam,
               td.Nom_domicili AS tipus_domicili_nom,
               dir.Num_calle,
               dir.Pis,
               dir.Escala,
               cal.Nom_calle,
               tv.Nom AS tipus_via_nom,
               b.Nom AS barri_nom,
               cp.Codi AS codi_postal_nom
        FROM Client c
        JOIN Genere g ON c.idGenere = g.idGenere
        JOIN Rol r ON c.idRol = r.idRol
        JOIN risc ris ON c.Risc = ris.idRisc
        LEFT JOIN resultat_academic ra ON c.Resultat_academic = ra.idResultat_academic
        JOIN situacio_economica se ON c.idSituacio_economica = se.idSituacio_economica
        JOIN sebas seb ON c.idSebas = seb.idSebas
        LEFT JOIN necessitats_especials ne ON c.idNecessitat_especial = ne.idNecessitat_especial
        LEFT JOIN curs_actual ca ON c.Curs_actual = ca.idCurs_actual
        JOIN pais p ON c.Pais_naixement = p.idPais
        JOIN Familia f ON c.idFamilia = f.idFamilia
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        JOIN Domicili d ON c.idDomicili = d.idDomicili
        JOIN tipus_domicili td ON d.Tipus_domicili = td.idTipus_domicili
        JOIN Direccio dir ON d.Direccio = dir.idDireccio
        JOIN callejero cal ON dir.idcallejero = cal.idcallejero
        JOIN tipus_via tv ON cal.idTipus_via = tv.idTipus_via
        JOIN barri b ON cal.idBarri = b.idBarri
        JOIN codi_postal cp ON cal.idCodi_postal = cp.idCodi_postal
        WHERE c.idClient = ?
    `, [id]);

    if (clientRows.length === 0) return null;

    const client = clientRows[0];

    const [projectRows] = await pool.query(`
        SELECT p.*
        FROM proyectos_has_client phc
        JOIN Proyectos p ON phc.idProyecto = p.idProyecto
        WHERE phc.idClient = ?
    `, [id]);

    const temps = calcTempsEntitat(client.Data_d_alta);

    return {
        ...client,
        temps_entitat: temps,
        projectes: projectRows
    };
}

async function create(clientData) {
    const {
        idFamilia,
        idRol,
        idGenere,
        Nom,
        Cognoms,
        Telefon,
        Correu_electronic,
        Data_d_alta,
        C_temps_a_lentitat,
        Fecha_nacimiento,
        C_edad,
        Data_baixa,
        Pais_naixement,
        Risc,
        Resultat_academic,
        Motiu_baixa,
        idSituacio_economica,
        idSebas,
        idNecessitat_especial,
        derivacio_serveis_socials,
        Curs_actual
    } = clientData;

    const [result] = await pool.query(
        `INSERT INTO Client (
            idFamilia, idRol, idGenere,
            Nom, Cognoms, Telefon, Correu_electronic,
            Data_d_alta, C_temps_a_lentitat,
            Fecha_nacimiento, C_edad,
            Data_baixa,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa,
            idSituacio_economica, idSebas, idNecessitat_especial,
            derivacio_serveis_socials,
            Curs_actual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            idFamilia, idRol, idGenere,
            Nom, Cognoms, Telefon ?? null, Correu_electronic ?? null,
            Data_d_alta, C_temps_a_lentitat,
            Fecha_nacimiento, C_edad,
            Data_baixa ?? null,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa ?? null,
            idSituacio_economica, idSebas, idNecessitat_especial ?? null,
            derivacio_serveis_socials,
            Curs_actual ?? null
        ]
    );

    return result.insertId;
}

async function update(id, clientData) {
    const {
        idFamilia,
        idRol,
        idGenere,
        Nom,
        Cognoms,
        Telefon,
        Correu_electronic,
        Data_d_alta,
        C_temps_a_lentitat,
        Fecha_nacimiento,
        C_edad,
        Data_baixa,
        Pais_naixement,
        Risc,
        Resultat_academic,
        Motiu_baixa,
        idSituacio_economica,
        idSebas,
        idNecessitat_especial,
        derivacio_serveis_socials,
        Curs_actual
    } = clientData;

    const [result] = await pool.query(
        `UPDATE Client
        SET
            idFamilia = ?, idRol = ?, idGenere = ?,
            Nom = ?, Cognoms = ?, Telefon = ?, Correu_electronic = ?,
            Data_d_alta = ?, C_temps_a_lentitat = ?,
            Fecha_nacimiento = ?, C_edad = ?,
            Data_baixa = ?,
            Pais_naixement = ?, Risc = ?, Resultat_academic = ?, Motiu_baixa = ?,
            idSituacio_economica = ?, idSebas = ?, idNecessitat_especial = ?,
            derivacio_serveis_socials = ?,
            Curs_actual = ?
        WHERE idClient = ?`,
        [
            idFamilia, idRol, idGenere,
            Nom, Cognoms, Telefon ?? null, Correu_electronic ?? null,
            Data_d_alta, C_temps_a_lentitat,
            Fecha_nacimiento, C_edad,
            Data_baixa ?? null,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa ?? null,
            idSituacio_economica, idSebas, idNecessitat_especial ?? null,
            derivacio_serveis_socials,
            Curs_actual ?? null,
            id
        ]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `DELETE FROM Client WHERE idClient = ?`,
        [id]
    );
    return result.affectedRows;
}

async function createFull(data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            domicili,
            familia,
            client,
            nacionalitat
        } = data;

        let idDireccio = null;
        let idDomicili = domicili?.idDomicili || null;

        if (domicili?.idcallejero && !idDomicili) {
            const [rDir] = await conn.query(
                `INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (?, ?, ?, ?)`,
                [domicili.idcallejero, domicili.Num_calle, domicili.Pis ?? null, domicili.Escala ?? null]
            );
            idDireccio = rDir.insertId;
        }

        if (idDireccio && !idDomicili) {
            const [rDom] = await conn.query(
                `INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (?, ?)`,
                [domicili.Tipus_domicili, idDireccio]
            );
            idDomicili = rDom.insertId;
        }

        let idFamilia = familia?.idFamilia || null;

        if (!idFamilia) {
            const [rFam] = await conn.query(
                `INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES (?, ?)`,
                [familia.Cognom_familiar, familia.Estructura_familiar]
            );
            idFamilia = rFam.insertId;
        }

        const [rCli] = await conn.query(
            `INSERT INTO Client (
                idFamilia, idRol, idGenere,
                Nom, Cognoms, Telefon, Correu_electronic,
                Data_d_alta, C_temps_a_lentitat,
                Fecha_nacimiento, C_edad,
                Pais_naixement, Risc, Resultat_academic,
                idSituacio_economica, idSebas, idNecessitat_especial,
                derivacio_serveis_socials,
                Curs_actual, idDomicili, Baixa
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idFamilia,
                client.idRol,
                client.idGenere,
                client.Nom,
                client.Cognoms,
                client.Telefon ?? null,
                client.Correu_electronic ?? null,
                client.Data_d_alta,
                client.C_temps_a_lentitat,
                client.Fecha_nacimiento,
                client.C_edad,
                client.Pais_naixement,
                client.Risc,
                client.Resultat_academic ?? null,
                client.idSituacio_economica,
                client.idSebas,
                client.idNecessitat_especial ?? null,
                client.derivacio_serveis_socials ?? 0,
                client.Curs_actual ?? null,
                idDomicili,
                0
            ]
        );
        const idClient = rCli.insertId;

        if (nacionalitat) {
            await conn.query(
                `INSERT INTO nacionalitat (idPais, idClient) VALUES (?, ?)`,
                [nacionalitat, idClient]
            );
        }

        await conn.commit();
        return idClient;

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

module.exports = {
    getAll,
    getById,
    getByIdEnhanced,
    create,
    update,
    remove,
    createFull
};
