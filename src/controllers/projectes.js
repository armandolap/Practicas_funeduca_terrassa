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
        
        projecte = req.body.projecte ; 
        console.log(projecte);

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