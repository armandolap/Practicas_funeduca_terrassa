const motiu_baixaRepository = require("../repositories/motiu_baixa");

//GET: /pais
async function getAllMotiu_baixa(req, res) {
    try {
        const motiu_baixa = await motiu_baixaRepository.getAll();

        res.status(200).json(motiu_baixa);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llistat de motius de baixa"
        });
    }
}

//GET: /pais/:id
async function getMotiu_baixaById(req, res) {
    try {
        const { id } = req.params;

        const motiu_baixa = await motiu_baixaRepository.getById(id);

        if (!motiu_baixa) {
            return res.status(404).json({
                message: "Motiu de baixa no trobat"
            });
        }

        res.status(200).json(motiu_baixa);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint motiu de baixa"
        });
    }
}

module.exports = {
    getAllMotiu_baixa,
    getMotiu_baixaById
};