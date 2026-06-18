const barriRepository = require("../repositories/barri");

async function getAllBarri(req, res) {
    try {
        const result = await barriRepository.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint barris" });
    }
}

async function getBarriById(req, res) {
    try {
        const { id } = req.params;
        const result = await barriRepository.getById(id);
        if (!result) {
            return res.status(404).json({ message: "Barri no trobat" });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint barri" });
    }
}

async function createBarri(req, res) {
    try {
        const { Nom } = req.body;
        if (!Nom?.trim()) {
            return res.status(400).json({ message: "El nom del barri és obligatori" });
        }
        const id = await barriRepository.create(Nom);
        res.status(201).json({ message: "Barri creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant barri" });
    }
}

async function updateBarri(req, res) {
    try {
        const { id } = req.params;
        const { Nom } = req.body;
        const affectedRows = await barriRepository.update(id, Nom);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Barri no trobat" });
        }
        res.status(200).json({ message: "Barri actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant barri" });
    }
}

async function deleteBarri(req, res) {
    try {
        const { id } = req.params;
        const affectedRows = await barriRepository.remove(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Barri no trobat" });
        }
        res.status(200).json({ message: "Barri eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant barri" });
    }
}

module.exports = {
    getAllBarri,
    getBarriById,
    createBarri,
    updateBarri,
    deleteBarri
};
