const paisosRepository = require("../repositories/paisos");

//GET: /pais
async function getAllPais(req, res) {
    try {
        const paises = await paisosRepository.getAll();

        res.status(200).json(paises);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint països"
        });
    }
}

//GET: /pais/:id
async function getPaisById(req, res) {
    try {
        const { id } = req.params;

        const pais = await paisosRepository.getById(id);

        if (!pais) {
            return res.status(404).json({
                message: "País no trobat"
            });
        }

        res.status(200).json(pais);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint país"
        });
    }
}

module.exports = {
    getAllPais,
    getPaisById
};