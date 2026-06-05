const SEBASRepository = require("../repositories/SEBAS");

//GET: /pais
async function getAllSEBAS(req, res) {
    try {
        const SEBAS = await SEBASRepository.getAll();

        res.status(200).json(SEBAS);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llista SEBAS"
        });
    }
}

//GET: /pais/:id
async function getSEBASById(req, res) {
    try {
        const { id } = req.params;

        const SEBAS = await SEBASRepository.getById(id);

        if (!SEBAS) {
            return res.status(404).json({
                message: "SEBAS no trobat"
            });
        }

        res.status(200).json(SEBAS);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint SEBAS"
        });
    }
}

module.exports = {
    getAllSEBAS,
    getSEBASById
};