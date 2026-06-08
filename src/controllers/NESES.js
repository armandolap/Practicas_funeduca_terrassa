const NESESRepository = require("../repositories/NESES");

//GET: /neses
async function getAllNESES(req, res) {
    try {
        const NESES = await NESESRepository.getAll();

        res.status(200).json(NESES);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llistat de necessitats especials"
        });
    }
}

//GET: /neses/:id
async function getNESESById(req, res) {
    try {
        const { id } = req.params;

        const NESES = await NESESRepository.getById(id);

        if (!NESES) {
            return res.status(404).json({
                message: "Necessitats especials no trobat"
            });
        }

        res.status(200).json(NESES);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint necessitats especials"
        });
    }
}

//POST: /neses
async function createNESES(req, res) {
    try {
        const { Nom_necessitat } = req.body;

        if (!Nom_necessitat) {
            return res.status(400).json({
                message: "El nom de la necessitat és obligatori"
            });
        }

        const id = await NESESRepository.create(Nom_necessitat);

        res.status(201).json({
            message: "Necessitat especial creada",
            id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creant necessitat especial"
        });
    }
}

//PUT: /neses/:id
async function updateNESES(req, res) {
    try {
        const { id } = req.params;
        const { Nom_necessitat } = req.body;

        const affectedRows = await NESESRepository.update(
            id,
            Nom_necessitat
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Necessitat no trobada"
            });
        }

        res.status(200).json({
            message: "Necessitat especial actualitzada"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error actualitzant necessitats especials"
        });
    }
}

//DELETE: /neses/:id
async function deleteNESES(req, res) {
    try {
        const { id } = req.params;

        const affectedRows = await NESESRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Necessitat especial no trobada"
            });
        }

        res.status(200).json({
            message: "Necessitat especial eliminada"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error eliminant necessitat especial"
        });
    }
}
module.exports = {
    getAllNESES,
    getNESESById,
    createNESES,
    updateNESES,
    deleteNESES
};