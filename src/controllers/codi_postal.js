const codi_postalRepository = require("../repositories/codi_postal");

async function getAllCodi_postal(req, res) {
    try {
        const result = await codi_postalRepository.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint codis postals" });
    }
}

async function getCodi_postalById(req, res) {
    try {
        const { id } = req.params;
        const result = await codi_postalRepository.getById(id);
        if (!result) {
            return res.status(404).json({ message: "Codi postal no trobat" });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint codi postal" });
    }
}

async function createCodi_postal(req, res) {
    try {
        const { Codi } = req.body;
        if (!Codi) {
            return res.status(400).json({ message: "El codi postal és obligatori" });
        }
        const id = await codi_postalRepository.create(Codi);
        res.status(201).json({ message: "Codi postal creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant codi postal" });
    }
}

async function updateCodi_postal(req, res) {
    try {
        const { id } = req.params;
        const { Codi } = req.body;
        const affectedRows = await codi_postalRepository.update(id, Codi);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Codi postal no trobat" });
        }
        res.status(200).json({ message: "Codi postal actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant codi postal" });
    }
}

async function deleteCodi_postal(req, res) {
    try {
        const { id } = req.params;
        const affectedRows = await codi_postalRepository.remove(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Codi postal no trobat" });
        }
        res.status(200).json({ message: "Codi postal eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant codi postal" });
    }
}

module.exports = {
    getAllCodi_postal,
    getCodi_postalById,
    createCodi_postal,
    updateCodi_postal,
    deleteCodi_postal
};
