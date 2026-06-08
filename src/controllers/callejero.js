const callejeroRepository = require("../repositories/callejero");

//GET: /calle
async function getAllCallejero(req, res) {
    try {
        const callejero = await callejeroRepository.getAll();

        res.status(200).json(callejero);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llista de Carrers"
        });
    }
}

//GET: /calle/:id
async function getCallejeroById(req, res) {
    try {
        const { id } = req.params;

        const callejero = await callejeroRepository.getById(id);

        if (!callejero) {
            return res.status(404).json({
                message: "Carrer no trobat"
            });
        }

        res.status(200).json(callejero);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint Carrer"
        });
    }
}

module.exports = {
    getAllCallejero,
    getCallejeroById
};