const repo = require("../repositories/familia");

async function getAllFamilias(req, res) {
    try {
        const { q, estructura, barri, offset, limit } = req.query;
        if (q || estructura || barri) {
            const result = await repo.getFiltered({ q, estructura, barri, offset, limit });
            return res.json(result);
        }
        if (offset !== undefined || limit !== undefined) {
            const result = await repo.getFiltered({ offset, limit });
            return res.json(result);
        }
        const familias = await repo.getAll();
        res.json(familias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint famílies" });
    }
}

async function getFamiliaById(req, res) {
    try {
        const familia = await repo.getDetailById(req.params.id);
        if (!familia) return res.status(404).json({ message: "Família no trobada" });
        res.json(familia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint família" });
    }
}

async function createFamilia(req, res) {
    try {
        const { Cognom_familiar, Estructura_familiar } = req.body || {};
        if (!Cognom_familiar?.trim()) {
            return res.status(400).json({ message: "Cognom_familiar obligatori" });
        }
        if (!Estructura_familiar) {
            return res.status(400).json({ message: "Estructura_familiar obligatòria" });
        }
        const id = await repo.create(Cognom_familiar, null, Estructura_familiar);
        res.status(201).json({ message: "Família creada", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant família" });
    }
}

async function updateFamilia(req, res) {
    try {
        const existing = await repo.getById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Família no trobada" });
        const { Cognom_familiar, Estructura_familiar } = req.body || {};
        if (!Cognom_familiar?.trim()) {
            return res.status(400).json({ message: "Cognom_familiar obligatori" });
        }
        await repo.update(req.params.id, Cognom_familiar, null, Estructura_familiar);
        res.json({ message: "Família actualitzada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant família" });
    }
}

async function deleteFamilia(req, res) {
    try {
        const affected = await repo.remove(req.params.id);
        if (affected === 0) return res.status(404).json({ message: "Família no trobada" });
        res.json({ message: "Família eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant família" });
    }
}

async function searchFamilies(req, res) {
    try {
        const { q } = req.query;
        if (!q?.trim()) return res.status(400).json({ message: "Paràmetre de cerca 'q' obligatori" });
        const families = await repo.searchByName(q.trim());
        res.json(families);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cercant famílies" });
    }
}

async function checkFamilyName(req, res) {
    try {
        const { name } = req.query;
        if (!name?.trim()) return res.status(400).json({ message: "Paràmetre 'name' obligatori" });
        const existing = await repo.existsByName(name.trim());
        res.json({ exists: !!existing, family: existing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error comprovant nom de família" });
    }
}

module.exports = { getAllFamilias, getFamiliaById, createFamilia, updateFamilia, deleteFamilia, searchFamilies, checkFamilyName };
