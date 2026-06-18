const nivelAccesoRepository = require("../repositories/nivel_acceso");

async function getAll(req, res) {
    try {
        const items = await nivelAccesoRepository.getAll();
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obtenint nivells d'accés" });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const item = await nivelAccesoRepository.getById(id);
        if (!item) return res.status(404).json({ message: "Nivell d'accés no trobat" });
        res.status(200).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obtenint nivell d'accés" });
    }
}

module.exports = { getAll, getById };
