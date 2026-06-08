const projectesRepository = require("../repositories/projectes");

// FALTEN PUT I POST per crear i modificar projectes

async function getAllProjectes(req, res) {
    try {
        const projecte = await projectesRepository.getAll();

        res.status(200).json(projecte);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llistat de projectes"
        });
    }
}

async function getProjectesById(req, res) {
    try {
        const { id } = req.params;

        const projecte = await projectesRepository.getById(id);

        if (!projecte) {
            return res.status(404).json({
                message: "Projecte no trobat"
            });
        }

        res.status(200).json(projecte);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint projecte"
        });
    }
}


async function createProject(req, res) {
    try {
        console.log("Creant projecte, de moment no fa res");

        projecte = req.body.projecte || {}; // por si viene vacío no pete el server por ser "undefined" 
        console.log(projecte);
        // 1. Creamos una constante con la fecha actual en formato 'YYYY-MM-DD' (ideal para SQL)
        const fechaActual = new Date().toISOString().split('T')[0];
        // Resultado: "2026-06-08T13:30:00.000Z" <--- la T separa la data de la hora, la fem servir per guardar en un format que SQL entengui com a DATE
        // OJO , guarda la data UTC ( no la "española" , però en teoria no afecta xk no hauria de ser buida ni fer-se entre les 21 i les 3 , aixi que no hi haurà problema)
        // 2. Desestructuramos asignando esa fecha como valor por defecto
        const {
            nom_projecte,
            descripcio,
            responsable,
            centro_coord,               // por defecto deberia ser la del centro de coord general , id = 1 ?? ( dnd fuimos )
            fecha_inicio = fechaActual,         // Si viene undefined, toma la fecha de hoy
            fecha_fin = fechaActual,            // Si viene undefined, toma la fecha de hoy
            ubicación,                          // por defecto deberia ser la del centro de coord 
            plazas = 0,                         // por defecto por ahora o està ok 
            inscritos = 0,                      // por defecto por ahora o està ok 
            fecha_inicio_act = fechaActual,   // Si viene undefined, toma la fecha de hoy
            fecha_fin_act = fechaActual       // Si viene undefined, toma la fecha de hoy
        } = projecte || {}; // El '|| {}' evita errors si projecte es null o undefined.


        // aseguramos que los datos están rellenados
        if (!nom_projecte?.trim() || !descripcio?.trim() || !responsable?.trim()) {
            // tirem error 400 (Bad Request) al client
            return res.status(400).json({
                error: "Faltan campos obligatorios, REPASAR : nom_projecte, descripcio y responsable QUE SÓN NECESSARIS."
            });
        }


    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint projecte"
        });
    }
}



module.exports = {
    getAllProjectes,
    getProjectesById,
    createProject
};