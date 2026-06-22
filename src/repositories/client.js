const { createPool } = require("../config/database");
const pool = createPool();

async function getAll() {
    const [rows] = await pool.query(`
        SELECT cl.*, f.Cognom_familiar, g.Nom_genere
        FROM client cl
        JOIN familia f ON cl.idFamilia = f.idFamilia
        JOIN genere g ON cl.idGenere = g.idGenere
        ORDER BY cl.Cognoms, cl.Nom
    `);
    return rows;
}

async function getFiltered({ q, familia, genere, barri, edatMin, edatMax, offset = 0, limit = 15 }) {
    let sql = `
        SELECT SQL_CALC_FOUND_ROWS cl.*, f.Cognom_familiar, g.Nom_genere,
               (SELECT GROUP_CONCAT(p.Nom_projecte SEPARATOR ', ')
                FROM proyectos_has_client phc
                JOIN proyectos p ON phc.idProyecto = p.idProyecto
                WHERE phc.idClient = cl.idClient
                  AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())) AS projectes
        FROM client cl
        JOIN familia f ON cl.idFamilia = f.idFamilia
        JOIN genere g ON cl.idGenere = g.idGenere
        WHERE 1=1
    `;
    const params = [];

    if (q && q.trim()) {
        sql += ` AND (cl.Nom LIKE ? OR cl.Cognoms LIKE ?)`;
        const like = `%${q.trim()}%`;
        params.push(like, like);
    }
    if (familia) {
        sql += ` AND cl.idFamilia = ?`;
        params.push(familia);
    }
    if (genere) {
        sql += ` AND cl.idGenere = ?`;
        params.push(genere);
    }
    if (barri) {
        sql += ` AND cl.idDomicili IN (
            SELECT dm.idDomicili FROM domicili dm
            JOIN direccio dir ON dm.Direccio = dir.idDireccio
            JOIN callejero c ON dir.idcallejero = c.idcallejero
            WHERE c.idBarri = ?
        )`;
        params.push(barri);
    }
    if (edatMin !== undefined && edatMin !== '') {
        sql += ` AND cl.C_edad >= ?`;
        params.push(parseInt(edatMin));
    }
    if (edatMax !== undefined && edatMax !== '') {
        sql += ` AND cl.C_edad <= ?`;
        params.push(parseInt(edatMax));
    }

    sql += ` ORDER BY cl.Cognoms, cl.Nom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);
    const [[{ total }]] = await pool.query(`SELECT FOUND_ROWS() AS total`);
    return { rows, total };
}

async function getDetailById(id) {
    const [rows] = await pool.query(`
        SELECT cl.*, f.Cognom_familiar, f.Estructura_familiar,
               ef.Nom_est_fam AS estructura_familiar_nom,
               g.Nom_genere, r.Nom_rol,
               d.idDomicili, d.Tipus_domicili, td.Nom_domicili AS tipus_domicili_nom,
               dir.idDireccio, dir.Num_calle, dir.Pis, dir.Escala,
               c.idcallejero, c.Nom_calle,
               tv.Nom AS tipus_via,
               b.Nom AS barri,
               cp.Codi AS codi_postal,
               ne.Nom_necessitat,
               se.Nom AS situacio_economica_nom,
               sb.Nom AS sebas_nom,
               risc.Nivel AS risc_nivell,
               ca.Nom AS curs_actual_nom,
               ra.Nom_resultat_acad,
               mb.Nom_motiu_baixa,
               pn.Nom_pais AS pais_naixement_nom,
               (SELECT COUNT(*) FROM proyectos_has_client phc WHERE phc.idClient = cl.idClient) AS num_activitats
        FROM client cl
        JOIN familia f ON cl.idFamilia = f.idFamilia
        JOIN estructura_familiar ef ON f.Estructura_familiar = ef.idEstructura_familiar
        JOIN genere g ON cl.idGenere = g.idGenere
        JOIN rol r ON cl.idRol = r.idRol
        LEFT JOIN domicili d ON cl.idDomicili = d.idDomicili
        LEFT JOIN tipus_domicili td ON d.Tipus_domicili = td.idTipus_domicili
        LEFT JOIN direccio dir ON d.Direccio = dir.idDireccio
        LEFT JOIN callejero c ON dir.idcallejero = c.idcallejero
        LEFT JOIN tipus_via tv ON c.idTipus_via = tv.idTipus_via
        LEFT JOIN barri b ON c.idBarri = b.idBarri
        LEFT JOIN codi_postal cp ON c.idCodi_postal = cp.idCodi_postal
        LEFT JOIN necessitats_especials ne ON cl.idNecessitat_especial = ne.idNecessitat_especial
        LEFT JOIN situacio_economica se ON cl.idSituacio_economica = se.idSituacio_economica
        LEFT JOIN sebas sb ON cl.idSebas = sb.idSebas
        LEFT JOIN risc ON cl.Risc = risc.idRisc
        LEFT JOIN curs_actual ca ON cl.Curs_actual = ca.idCurs_actual
        LEFT JOIN resultat_academic ra ON cl.Resultat_academic = ra.idResultat_academic
        LEFT JOIN motiu_baixa mb ON cl.Motiu_baixa = mb.idMotiu_baixa
        LEFT JOIN pais pn ON cl.Pais_naixement = pn.idPais
        WHERE cl.idClient = ?
    `, [id]);
    return rows[0] || null;
}

async function getNacionalitats(idClient) {
    const [rows] = await pool.query(`
        SELECT p.idPais, p.Nom_pais
        FROM nacionalitat n
        JOIN pais p ON n.idPais = p.idPais
        WHERE n.idClient = ?
        ORDER BY p.Nom_pais
    `, [idClient]);
    return rows;
}

async function addNacionalitat(idClient, idPais) {
    await pool.query(
        `INSERT IGNORE INTO nacionalitat (idPais, idClient) VALUES (?, ?)`,
        [idPais, idClient]
    );
}

async function removeNacionalitat(idClient, idPais) {
    const [result] = await pool.query(
        `DELETE FROM nacionalitat WHERE idClient = ? AND idPais = ?`,
        [idClient, idPais]
    );
    return result.affectedRows;
}

async function getProjectsByClient(id, filter = "tots") {
    let sql = `
        SELECT p.*,
               CASE WHEN p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act <= CURDATE()
                     AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE()) THEN 'actiu'
                    WHEN p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act > CURDATE() THEN 'futur'
                    ELSE 'tancat' END AS estat_projecte
        FROM proyectos_has_client phc
        JOIN proyectos p ON phc.idProyecto = p.idProyecto
        WHERE phc.idClient = ?
    `;
    if (filter === "actius") {
        sql += ` AND (p.fecha_inicio_act IS NULL OR p.fecha_inicio_act <= CURDATE())
                 AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())`;
    } else if (filter === "futur") {
        sql += ` AND (p.fecha_inicio_act IS NOT NULL AND p.fecha_inicio_act > CURDATE())`;
    } else if (filter === "passats") {
        sql += ` AND p.fecha_fin_act IS NOT NULL AND p.fecha_fin_act < CURDATE()`;
    }
    sql += ` ORDER BY p.fecha_inicio_act DESC`;
    const [rows] = await pool.query(sql, [id]);
    return rows;
}

async function create(clientData) {
    const { idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic,
            Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Data_baixa,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa, idSituacio_economica,
            idSebas, idNecessitat_especial, derivacio_serveis_socials, Curs_actual,
            idDomicili, Baixa } = clientData;
    const [result] = await pool.query(`
        INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic,
            Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Data_baixa,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa, idSituacio_economica,
            idSebas, idNecessitat_especial, derivacio_serveis_socials, Curs_actual,
            idDomicili, Baixa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [idFamilia, idRol, idGenere, Nom, Cognoms, Telefon ?? null, Correu_electronic ?? null,
        Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Data_baixa ?? null,
        Pais_naixement, Risc, Resultat_academic, Motiu_baixa ?? null, idSituacio_economica,
        idSebas, idNecessitat_especial ?? null, derivacio_serveis_socials, Curs_actual ?? null,
        idDomicili ?? null, Baixa ?? 0]);
    return result.insertId;
}

async function update(id, clientData) {
    const { idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic,
            Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Data_baixa,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa, idSituacio_economica,
            idSebas, idNecessitat_especial, derivacio_serveis_socials, Curs_actual,
            idDomicili, Baixa } = clientData;
    const [result] = await pool.query(`
        UPDATE client SET idFamilia=?, idRol=?, idGenere=?, Nom=?, Cognoms=?, Telefon=?, Correu_electronic=?,
            Data_d_alta=?, C_temps_a_lentitat=?, Fecha_nacimiento=?, C_edad=?, Data_baixa=?,
            Pais_naixement=?, Risc=?, Resultat_academic=?, Motiu_baixa=?, idSituacio_economica=?,
            idSebas=?, idNecessitat_especial=?, derivacio_serveis_socials=?, Curs_actual=?,
            idDomicili=?, Baixa=?
        WHERE idClient=?
    `, [idFamilia, idRol, idGenere, Nom, Cognoms, Telefon ?? null, Correu_electronic ?? null,
        Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad, Data_baixa ?? null,
        Pais_naixement, Risc, Resultat_academic, Motiu_baixa ?? null, idSituacio_economica,
        idSebas, idNecessitat_especial ?? null, derivacio_serveis_socials, Curs_actual ?? null,
        idDomicili ?? null, Baixa ?? 0, id]);
    return result.affectedRows;
}

async function setBaixa(id, { Motiu_baixa, Data_baixa }) {
    const [result] = await pool.query(
        `UPDATE client SET Baixa = 1, Motiu_baixa = ?, Data_baixa = ? WHERE idClient = ?`,
        [Motiu_baixa ?? null, Data_baixa, id]
    );
    return result.affectedRows;
}

async function setAlta(id) {
    const [result] = await pool.query(
        `UPDATE client SET Baixa = 0, Motiu_baixa = NULL, Data_baixa = NULL WHERE idClient = ?`,
        [id]
    );
    return result.affectedRows;
}

async function remove(id) {
    await pool.query(`DELETE FROM proyectos_has_client WHERE idClient = ?`, [id]);
    await pool.query(`DELETE FROM nacionalitat WHERE idClient = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM client WHERE idClient = ?`, [id]);
    return result.affectedRows;
}

async function createFull(data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { domicili, familia, client, nacionalitat } = data;
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
                `INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (?, ?)`,
                [domicili.Tipus_domicili, idDireccio]
            );
            idDomicili = rDom.insertId;
        }
        let idFamilia = familia?.idFamilia || null;
        if (!idFamilia) {
            const [rFam] = await conn.query(
                `INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES (?, ?)`,
                [familia.Cognom_familiar, familia.Estructura_familiar]
            );
            idFamilia = rFam.insertId;
        }
        const [rCli] = await conn.query(`
            INSERT INTO client (idFamilia, idRol, idGenere, Nom, Cognoms, Telefon, Correu_electronic,
                Data_d_alta, C_temps_a_lentitat, Fecha_nacimiento, C_edad,
                Pais_naixement, Risc, Resultat_academic, idSituacio_economica, idSebas, idNecessitat_especial,
                derivacio_serveis_socials, Curs_actual, idDomicili, Baixa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [idFamilia, client.idRol, client.idGenere, client.Nom, client.Cognoms,
            client.Telefon ?? null, client.Correu_electronic ?? null,
            client.Data_d_alta, client.C_temps_a_lentitat, client.Fecha_nacimiento, client.C_edad,
            client.Pais_naixement, client.Risc, client.Resultat_academic ?? null,
            client.idSituacio_economica, client.idSebas, client.idNecessitat_especial ?? null,
            client.derivacio_serveis_socials ?? 0, client.Curs_actual ?? null, idDomicili, 0]);
        const idClient = rCli.insertId;
        if (nacionalitat) {
            await conn.query(`INSERT INTO nacionalitat (idPais, idClient) VALUES (?, ?)`, [nacionalitat, idClient]);
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

async function updateFull(id, data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { domicili, familia, client } = data;
        let idDomicili = client.idDomicili || domicili?.idDomicili || null;

        if (domicili?.idcallejero && !idDomicili) {
            const [rDir] = await conn.query(
                `INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (?, ?, ?, ?)`,
                [domicili.idcallejero, domicili.Num_calle, domicili.Pis ?? null, domicili.Escala ?? null]
            );
            const [rDom] = await conn.query(
                `INSERT INTO domicili (Tipus_domicili, Direccio) VALUES (?, ?)`,
                [domicili.Tipus_domicili || 1, rDir.insertId]
            );
            idDomicili = rDom.insertId;
        }

        let idFamilia = client.idFamilia || familia?.idFamilia || null;
        if (!idFamilia && familia?.Cognom_familiar) {
            const [rFam] = await conn.query(
                `INSERT INTO familia (Cognom_familiar, Estructura_familiar) VALUES (?, ?)`,
                [familia.Cognom_familiar, familia.Estructura_familiar || null]
            );
            idFamilia = rFam.insertId;
        }

        await conn.query(`
            UPDATE client SET idFamilia=?, idRol=?, idGenere=?, Nom=?, Cognoms=?, Telefon=?, Correu_electronic=?,
                Data_d_alta=?, C_temps_a_lentitat=?, Fecha_nacimiento=?, C_edad=?,
                Pais_naixement=?, Risc=?, Resultat_academic=?, idSituacio_economica=?, idSebas=?, idNecessitat_especial=?,
                derivacio_serveis_socials=?, Curs_actual=?, idDomicili=?, Baixa=?
            WHERE idClient=?
        `, [idFamilia, client.idRol, client.idGenere, client.Nom, client.Cognoms,
            client.Telefon ?? null, client.Correu_electronic ?? null,
            client.Data_d_alta, client.C_temps_a_lentitat, client.Fecha_nacimiento, client.C_edad,
            client.Pais_naixement, client.Risc, client.Resultat_academic ?? null,
            client.idSituacio_economica, client.idSebas, client.idNecessitat_especial ?? null,
            client.derivacio_serveis_socials ?? 0, client.Curs_actual ?? null, idDomicili, client.Baixa ?? 0, id]);

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

module.exports = { getAll, getFiltered, getDetailById, getProjectsByClient, getNacionalitats, addNacionalitat, removeNacionalitat, setBaixa, setAlta, create, update, remove, createFull, updateFull };
