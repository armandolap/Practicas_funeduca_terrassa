const paisosRepository = require("../repositories/tipus_domicili");

//GET: /pais
async function getAlltipus_domicili(req, res) {
    try {
        const paises = await tipus_domiciliRepository.getAll();

        res.status(200).json(paises);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint tipus de Domicili"
        });
    }
}

//GET: /tipo_domicilio/:id
async function gettipus_domiciliById(req, res) {
    try {
        const { id } = req.params;

        const pais = await tipus_domiciliRepository.getById(id);

        if (!pais) {
            return res.status(404).json({
                message: "Tipus de Domicili no trobat"
            });
        }

        res.status(200).json(pais);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint tipus de Domicili"
        });
    }
}

module.exports = {
    getAlltipus_domicili,
    gettipus_domiciliById
};