const NESESRepository = require("../repositories/NESES");

//GET: /pais
async function getAllNESES(req, res) {
    try {
        const NESES = await NESESRepository.getAll();

        res.status(200).json(NESES);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llistat de NESES"
        });
    }
}

//GET: /pais/:id
async function getNESESById(req, res) {
    try {
        const { id } = req.params;

        const NESES = await NESESRepository.getById(id);

        if (!NESES) {
            return res.status(404).json({
                message: "NESES no trobat"
            });
        }

        res.status(200).json(NESES);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint NESES"
        });
    }
}

module.exports = {
    getAllNESES,
    getNESESById
};