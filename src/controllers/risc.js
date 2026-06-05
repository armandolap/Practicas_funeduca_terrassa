const riscRepository = require("../repositories/risc");

//GET: /pais
async function getAllRisc(req, res) {
    try {
        const risc = await riscRepository.getAll();

        res.status(200).json(risc);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint nivell de risc"
        });
    }
}

//GET: /pais/:id
async function getRiscById(req, res) {
    try {
        const { id } = req.params;

        const risc = await riscRepository.getById(id);

        if (!risc) {
            return res.status(404).json({
                message: "Nivell de risc no trobat"
            });
        }

        res.status(200).json(risc);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint nivell de risc"
        });
    }
}

module.exports = {
    getAllRisc,
    getRiscById
};