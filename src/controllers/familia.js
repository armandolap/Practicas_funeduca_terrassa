const familiaRepository = require("../repositories/familia");

// GET /familia
async function getAllFamilias(req, res) {
    try {
        const familias = await familiaRepository.getAll();

        res.status(200).json(familias);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint famílies"
        });
    }
}

// GET /familia/:id
async function getFamiliaById(req, res) {
    try {
        const { id } = req.params;

        const familia = await familiaRepository.getById(id);

        if (!familia) {
            return res.status(404).json({
                message: "Família no trobada"
            });
        }

        res.status(200).json(familia);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint família"
        });
    }
}

// POST /familia
async function createFamilia(req, res) {
    try {
        const {
            Cognom_familiar,
            idDomicili,
            Estructura_familiar
        } = req.body;

        const id = await familiaRepository.create(
            Cognom_familiar,
            idDomicili,
            Estructura_familiar
        );

        res.status(201).json({
            message: "Família creada",
            id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creant família"
        });
    }
}

// PUT /familia/:id
async function updateFamilia(req, res) {
    try {
        const { id } = req.params;

        const {
            Cognom_familiar,
            idDomicili,
            Estructura_familiar
        } = req.body;

        const affectedRows = await familiaRepository.update(
            id,
            Cognom_familiar,
            idDomicili,
            Estructura_familiar
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Família no trobada"
            });
        }

        res.status(200).json({
            message: "Família actualitzada"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error actualitzant família"
        });
    }
}

// DELETE /familia/:id
async function deleteFamilia(req, res) {
    try {
        const { id } = req.params;

        const affectedRows = await familiaRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Família no trobada"
            });
        }

        res.status(200).json({
            message: "Família eliminada"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error eliminant família"
        });
    }
}

module.exports = {
    getAllFamilias,
    getFamiliaById,
    createFamilia,
    updateFamilia,
    deleteFamilia
};