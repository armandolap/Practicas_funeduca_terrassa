const tipus_domiciliRepository = require("../repositories/tipus_domicili");

//GET: /tipusDom
async function getAlltipus_domicili(req, res) {
    try {
        const tipus_domicili = await tipus_domiciliRepository.getAll();

        res.status(200).json(tipus_domicili);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint tipus de Domicili"
        });
    }
}

//GET: /tipusDom/:id
async function getTipus_domiciliById(req, res) {
    try {
        const { id } = req.params;

        const tipus_domicili = await tipus_domiciliRepository.getById(id);

        if (!tipus_domicili) {
            return res.status(404).json({
                message: "Tipus de Domicili no trobat"
            });
        }

        res.status(200).json(tipus_domicili);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint tipus de Domicili"
        });
    }
}

module.exports = {
    getAlltipus_domicili,
    getTipus_domiciliById
};