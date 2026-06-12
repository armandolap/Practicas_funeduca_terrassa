const tipus_viaRepository = require("../repositories/tipus_via");

async function getAllTipus_via(req, res) {
    try {
        const result = await tipus_viaRepository.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint tipus de via" });
    }
}

async function getTipus_viaById(req, res) {
    try {
        const { id } = req.params;
        const result = await tipus_viaRepository.getById(id);
        if (!result) {
            return res.status(404).json({ message: "Tipus de via no trobat" });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint tipus de via" });
    }
}

async function createTipus_via(req, res) {
    try {
        const { Nom } = req.body;
        if (!Nom) {
            return res.status(400).json({ message: "El nom del tipus de via és obligatori" });
        }
        const id = await tipus_viaRepository.create(Nom);
        res.status(201).json({ message: "Tipus de via creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant tipus de via" });
    }
}

async function updateTipus_via(req, res) {
    try {
        const { id } = req.params;
        const { Nom } = req.body;
        const affectedRows = await tipus_viaRepository.update(id, Nom);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Tipus de via no trobat" });
        }
        res.status(200).json({ message: "Tipus de via actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant tipus de via" });
    }
}

async function deleteTipus_via(req, res) {
    try {
        const { id } = req.params;
        const affectedRows = await tipus_viaRepository.remove(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Tipus de via no trobat" });
        }
        res.status(200).json({ message: "Tipus de via eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant tipus de via" });
    }
}

module.exports = {
    getAllTipus_via,
    getTipus_viaById,
    createTipus_via,
    updateTipus_via,
    deleteTipus_via
};
