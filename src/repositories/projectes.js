const { createPool } = require("../config/database");

const pool = createPool();
// aqui v ala peticion al server SQL 
// FALTEN PUT i POST per editar i crear

async function getAll() {
    const [rows] = await pool.query(`
    SELECT *
    FROM Proyectos
    ORDER BY Nom_projecte
  `);

    return rows;
}

async function getById(id) {
    const [rows] = await pool.query(
        `
    SELECT *
    FROM Proyectos
    WHERE idProyecto = ?
    `,
        [id]
    );

    return rows[0] || null;
}



async function create(projecteData) {
    // Desestructuramos para mayor claridad y asignamos valores por defecto de BBDD si es necesario
    const {
        Nom_projecte,
        Descripcio,
        responsable,
        Centro_coord = 1, // Valor por defecto a nivel de BBDD si no viene
        fecha_inicio,
        fecha_fin,
        //ubicacion,
        plazas = 0,
        inscritos = 0,
        fecha_inicio_act,
        fecha_fin_act
    } = projecteData;

    // Consulta parametrizada. El orden de las '?' debe coincidir EXACTAMENTE con el array 'values'
    const query = `
        INSERT INTO Proyectos (
            Nom_projecte, 
            Descripcio, 
            responsable, 
            Centre_coordinacio, 
            fecha_inicio, 
            fecha_fin, 
            plazas, 
            inscritos, 
            fecha_inicio_act, 
            fecha_fin_act
            -- ubicacion,
        ) VALUES (?, ?, ?, ?, ?, ?,  ?, ?, ?, ?)
    `; // cuidado que els 7o ? se ha quitado para no meter la ubicacion

    const values = [
        Nom_projecte,
        Descripcio,
        responsable,
        Centro_coord,
        fecha_inicio,
        fecha_fin,
        plazas,
        inscritos,
        fecha_inicio_act,
        fecha_fin_act,
        //ubicacion,
    ];

    // Ejecutamos la query. 'result' contendrá { affectedRows: 1, insertId: 42, ... }
    const [result] = await pool.query(query, values);
    
    return result.insertId;
}




module.exports = {
    getAll,
    getById,
    create
};