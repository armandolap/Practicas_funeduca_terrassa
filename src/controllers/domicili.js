const repo = require("../repositories/domicili");

async function getAllDomicilis(req, res) {
    try {
        const { barri, tipus, offset, limit } = req.query;
        if (barri || tipus) {
            const result = await repo.getFiltered({ barri, tipus, offset, limit });
            return res.json(result);
        }
        const domicilis = await repo.getAll();
        res.json(domicilis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint domicilis" });
    }
}

async function getDomiciliById(req, res) {
    try {
        const domicili = await repo.getDetailById(req.params.id);
        if (!domicili) return res.status(404).json({ message: "Domicili no trobat" });
        res.json(domicili);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint domicili" });
    }
}

async function createDomicili(req, res) {
    try {
        const { Tipus_domicili, Direccio } = req.body || {};
        if (!Tipus_domicili || !Direccio) {
            return res.status(400).json({ message: "Tipus_domicili i Direccio obligatoris" });
        }
        const id = await repo.create(Tipus_domicili, Direccio);
        res.status(201).json({ message: "Domicili creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant domicili" });
    }
}

async function updateDomicili(req, res) {
    try {
        const existing = await repo.getById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Domicili no trobat" });
        const { Tipus_domicili, Direccio } = req.body || {};
        if (!Tipus_domicili || !Direccio) {
            return res.status(400).json({ message: "Tipus_domicili i Direccio obligatoris" });
        }
        await repo.update(req.params.id, Tipus_domicili, Direccio);
        res.json({ message: "Domicili actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant domicili" });
    }
}

async function deleteDomicili(req, res) {
    try {
        const affected = await repo.remove(req.params.id);
        if (affected === 0) return res.status(404).json({ message: "Domicili no trobat" });
        res.json({ message: "Domicili eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant domicili" });
    }
}

async function getDomicilisByFamily(req, res) {
    try {
        const domicilis = await repo.getByFamily(req.params.idFamilia);
        res.json(domicilis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint domicilis de la família" });
    }
}

async function searchDomicilisCarrer(req, res) {
    try {
        const { q, tipus_via, idFamilia } = req.query;
        const results = await repo.searchCombined({ q: q || "", tipus_via: tipus_via || null, idFamilia: idFamilia || null });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cercant domicilis i carrers" });
    }
}

module.exports = { getAllDomicilis, getDomiciliById, createDomicili, updateDomicili, deleteDomicili, getDomicilisByFamily, searchDomicilisCarrer };
