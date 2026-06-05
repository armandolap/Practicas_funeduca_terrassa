// const pool = require("../config/database");

// async function getAll() {
//     const [rows] = await pool.query(`
//     SELECT *
//     FROM Tipus_domicili
//     ORDER BY Nom_domicili
//   `);

//     return rows;
// }

// async function getById(id) {
//     const [rows] = await pool.query(
//         `
//     SELECT *
//     FROM Tipus_domicili
//     WHERE idTipus_domicili = ?
//     `,
//         [id]
//     );

//     return rows[0] || null;
// }

// module.exports = {
//     getAll,
//     getById
// };