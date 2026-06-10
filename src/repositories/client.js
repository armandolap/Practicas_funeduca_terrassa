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

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
