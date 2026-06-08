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

        // 2. Desestructuramos asignando esa fecha como valor por defecto
        const {
            nom_projecte,
            descripcio,
            responsable,
            centro_coord,
            fecha_inicio = fechaActual,       // Si viene undefined, toma la fecha de hoy
            fecha_fin = fechaActual,          // Si viene undefined, toma la fecha de hoy
            ubicación,
            plazas = 0,
            inscritos = 0,
            fecha_inicio_act = fechaActual,   // Si viene undefined, toma la fecha de hoy
            fecha_fin_act = fechaActual       // Si viene undefined, toma la fecha de hoy
        } = projecte || {}; // El '|| {}' evita errors si projecte es null o undefined.






        


        //    `idProyecto` INT NOT NULL AUTO_INCREMENT,
        //   `Nom_projecte` VARCHAR(45) NOT NULL,
        //   'Descripcio' VARCHAR(512) ,
        //   -- 'responsable' <--- foreign key usuario?
        //   -- -- OK -- 'centro_coord' <--- foreign key ? falta tabla centros de coord?
        //   'fecha_inicio' DATE NOT NULL , -- inicio proyecto, no actividad, por defecto cuando se crea 
        //   'fecha_fin' DATE ,  
        //   -- 'ubicación'
        //   'plazas' INT NOT NULL,
        //   'inscritos' INT NOT NULL,
        //   'fecha_inicio_act' DATE ,
        //   'fecha_fin_act' DATE ,
        //   `Centre_coordinacio` INT NOT NULL,



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