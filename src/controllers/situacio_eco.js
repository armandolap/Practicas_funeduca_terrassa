const paisosRepository = require("../repositories/situacio_eco");

//GET: /pais
async function getAllsituacio_eco(req, res) {
    try {
        const situacio_eco = await Situacio_ecoRepository.getAll();

        res.status(200).json(situacio_eco);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint situacions econòmiques"
        });
    }
}

//GET: /pais/:id
async function getsituacio_ecoById(req, res) {
    try {
        const { id } = req.params;

        const situacio_eco = await Situacio_ecoRepository.getById(id);

        if (!situacio_eco) {
            return res.status(404).json({
                message: "situacions econòmica no trobat"
            });
        }

        res.status(200).json(situacio_eco);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint situació econòmica"
        });
    }
}

module.exports = {
    getAllsituacio_eco,
    getsituacio_ecoById
};