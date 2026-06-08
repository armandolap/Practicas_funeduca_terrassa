const estructura_familiarRepository = require("../repositories/estructura_familiar");

//GET: /estFamilia
async function getAllEstructura_familiar(req, res) {
    try {
        const estructura_familiar = await estructura_familiarRepository.getAll();

        res.status(200).json(estructura_familiar);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llistat d'estructures familiars"
        });
    }
}

//GET: /estFamilia/:id
async function getEstructura_familiarById(req, res) {
    try {
        const { id } = req.params;

        const estructura_familiar = await estructura_familiarRepository.getById(id);

        if (!estructura_familiar) {
            return res.status(404).json({
                message: "Estructura familiar no trobada"
            });
        }

        res.status(200).json(estructura_familiar);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint estructura_familiar"
        });
    }
}

module.exports = {
    getAllEstructura_familiar,
    getEstructura_familiarById
};