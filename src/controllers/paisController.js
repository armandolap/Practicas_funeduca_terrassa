const paisRepository = require("../repositories/paisRepository");

//GET: /pais
async function getAllPais(req, res) {
    try {
        const paises = await paisRepository.getAll();

        res.status(200).json(paises);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obteniendo países"
        });
    }
}

//GET: /pais/:id
async function getPaisById(req, res) {
    try {
        const { id } = req.params;

        const pais = await paisRepository.getById(id);

        if (!pais) {
            return res.status(404).json({
                message: "País no encontrado"
            });
        }

        res.status(200).json(pais);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obteniendo país"
        });
    }
}

module.exports = {
    getAllPais,
    getPaisById
};