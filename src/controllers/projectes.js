const projectesRepository = require("../repositories/projectes");

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

module.exports = {
    getAllProjectes,
    getProjectesById
};