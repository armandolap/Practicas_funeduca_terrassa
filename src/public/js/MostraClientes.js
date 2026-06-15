// module.exports = {
//     getAllClients,
//     getClientById,
//     createClient,
//     updateClient,
//     deleteClient
// };

// async function getAllClients(req, res) {
//     try {
//         const clients = await clientRepository.getAll();

//         res.status(200).json(clients);
//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             message: "Error obtenint clients"
//         });
//     }
// }

// Vista de clientes (usuarios de los proyectos)
// Arriba un boton de crear nuevo
// Debajo un campo de filtos:
//     Por nombre
//     Por edad
//     Por familias
//     Por genero 
//     Por barri
// Luego una lista con los nombres y apellidos de los usuarios
//     Campos extra:
//                 Edad 
//                 Familia
//                 Proyecto en el que participa
// _________________________________


//const path = require("path"); // par also requiere seria lo suyo usarlo... 

//const  = require("../repositories/client");


const barri = require("../repositories/barri");
// [barri] --> array amb els noms del barris per posar al desplegable

async function clientViewFilter ( ) {
    try {
    const [barris] = barri.getAllNom();


    } catch (err) {
        console.error("no hem obtingut llista de barris:", err )
    };
}; 

module.exports = {
    clientViewFilter ,
}
