const projectesRepository = require("../repositories/projectes");

// GET /projectes
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

// GET /projectes/:id
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

// POST /projectes
async function createProject(req, res) {
    try {

        const projecte = req.body.projecte || {};

        // Fecha actual en formato YYYY-MM-DD
        const fechaActual = new Date().toISOString().split("T")[0];

        const {
            Nom_projecte,
            Descripcio = null,
            plazas = 0,
            inscritos = 0,
            fecha_inicio_act = null,
            fecha_fin_act = null,
            idcentre_activitats
        } = projecte;

        // Validaciones mínimas
        if (!Nom_projecte?.trim()) {
            return res.status(400).json({
                message: "El nom del projecte és obligatori."
            });
        }

        if (!idcentre_activitats) {
            return res.status(400).json({
                message: "idcentre_activitats és obligatori."
            });
        }

        const nuevoProjecteId = await projectesRepository.create({
            Nom_projecte,
            Descripcio,
            plazas,
            inscritos,
            fecha_inicio_act,
            fecha_fin_act,
            idcentre_activitats
        });

        res.status(201).json({
            message: "Projecte creat correctament",
            id: nuevoProjecteId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creant projecte"
        });
    }
}

module.exports = {
    getAllProjectes,
    getProjectesById,
    createProject
};