const { createPool } = require("../config/database");

const pool = createPool();
// TODO: ubicacion — afegir gestió de Client_has_Domicili

async function getAll() {
    const [rows] = await pool.query(`
        SELECT *
        FROM Client
        ORDER BY Cognoms, Nom
    `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM Client
        WHERE idClient = ?
        `,
        [id]
    );

    return rows[0] || null;
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
        derivacio_serveis_socials,
        Curs_actual
    } = clientData;

    const [result] = await pool.query(
        `
        INSERT INTO Client (
            idFamilia, idRol, idGenere,
            Nom, Cognoms, Telefon, Correu_electronic,
            Data_d_alta, C_temps_a_lentitat,
            Fecha_nacimiento, C_edad,
            Data_baixa,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa,
            idSituacio_economica, idSebas,
            derivacio_serveis_socials,
            Curs_actual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            idFamilia, idRol, idGenere,
            Nom, Cognoms, Telefon ?? null, Correu_electronic ?? null,
            Data_d_alta, C_temps_a_lentitat,
            Fecha_nacimiento, C_edad,
            Data_baixa ?? null,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa ?? null,
            idSituacio_economica, idSebas,
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
        derivacio_serveis_socials,
        Curs_actual
    } = clientData;

    const [result] = await pool.query(
        `
        UPDATE Client
        SET
            idFamilia = ?, idRol = ?, idGenere = ?,
            Nom = ?, Cognoms = ?, Telefon = ?, Correu_electronic = ?,
            Data_d_alta = ?, C_temps_a_lentitat = ?,
            Fecha_nacimiento = ?, C_edad = ?,
            Data_baixa = ?,
            Pais_naixement = ?, Risc = ?, Resultat_academic = ?, Motiu_baixa = ?,
            idSituacio_economica = ?, idSebas = ?,
            derivacio_serveis_socials = ?,
            Curs_actual = ?
        WHERE idClient = ?
        `,
        [
            idFamilia, idRol, idGenere,
            Nom, Cognoms, Telefon ?? null, Correu_electronic ?? null,
            Data_d_alta, C_temps_a_lentitat,
            Fecha_nacimiento, C_edad,
            Data_baixa ?? null,
            Pais_naixement, Risc, Resultat_academic, Motiu_baixa ?? null,
            idSituacio_economica, idSebas,
            derivacio_serveis_socials,
            Curs_actual ?? null,
            id
        ]
    );

    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query(
        `
        DELETE FROM Client
        WHERE idClient = ?
        `,
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

        // 1. Create direccio if we have address data
        if (domicili?.idcallejero && !idDomicili) {
            const [rDir] = await conn.query(
                `INSERT INTO direccio (idcallejero, Num_calle, Pis, Escala) VALUES (?, ?, ?, ?)`,
                [domicili.idcallejero, domicili.Num_calle, domicili.Pis ?? null, domicili.Escala ?? null]
            );
            idDireccio = rDir.insertId;
        }

        // 2. Create domicili if we have a direccio and no existing domicile
        if (idDireccio && !idDomicili) {
            const [rDom] = await conn.query(
                `INSERT INTO Domicili (Tipus_domicili, Direccio) VALUES (?, ?)`,
                [domicili.Tipus_domicili, idDireccio]
            );
            idDomicili = rDom.insertId;
        }

        let idFamilia = familia?.idFamilia || null;

        // 3. Create familia if not assigned
        if (!idFamilia) {
            const [rFam] = await conn.query(
                `INSERT INTO Familia (Cognom_familiar, Estructura_familiar) VALUES (?, ?)`,
                [familia.Cognom_familiar, familia.Estructura_familiar]
            );
            idFamilia = rFam.insertId;
        }

        // 4. Create client
        const [rCli] = await conn.query(
            `INSERT INTO Client (
                idFamilia, idRol, idGenere,
                Nom, Cognoms, Telefon, Correu_electronic,
                Data_d_alta, C_temps_a_lentitat,
                Fecha_nacimiento, C_edad,
                Pais_naixement, Risc, Resultat_academic,
                idSituacio_economica, idSebas,
                derivacio_serveis_socials,
                Curs_actual, idDomicili, Baixa
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                client.derivacio_serveis_socials ?? 0,
                client.Curs_actual ?? null,
                idDomicili,
                0
            ]
        );
        const idClient = rCli.insertId;

        // 5. Create nacionalitat
        if (nacionalitat) {
            await conn.query(
                `INSERT INTO nacionalitat (idPais, idClient) VALUES (?, ?)`,
                [nacionalitat, idClient]
            );
        }

        // 6. Create necessitats_especials associations
        const neses = data.necessitats_especials || [];
        if (neses.length > 0) {
            const neseValues = neses.map(id => [id, idClient]);
            await conn.query(
                `INSERT INTO necessitats_especials_has_client (idNecessitat_especial, idClient) VALUES ?`,
                [neseValues]
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
    create,
    update,
    remove,
    createFull
};
