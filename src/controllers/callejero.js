const callejeroRepository = require("../repositories/callejero");

async function searchCallejero(req, res) {
    try {
        const { tipus_via, q } = req.query;
        const result = await callejeroRepository.search({ tipus_via, q });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cercant carrers" });
    }
}

async function getCallejeroById(req, res) {
    try {
        const { id } = req.params;
        const result = await callejeroRepository.getById(id);
        if (!result) {
            return res.status(404).json({ message: "Carrer no trobat" });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint carrer" });
    }
}

module.exports = {
    searchCallejero,
    getCallejeroById
};
