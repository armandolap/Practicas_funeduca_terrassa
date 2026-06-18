const repo = require("../repositories/centre_activitats");

async function getAll(req, res) {
    try {
        const { q } = req.query;
        const items = q ? await repo.search({ q }) : await repo.getAll();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint centres d'activitats" });
    }
}

async function getById(req, res) {
    try {
        const item = await repo.getById(req.params.id);
        if (!item) return res.status(404).json({ message: "Centre no trobat" });
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint centre" });
    }
}

async function search(req, res) {
    try {
        const { q } = req.query;
        const items = await repo.search({ q });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cercant centres" });
    }
}

async function create(req, res) {
    try {
        const id = await repo.create(req.body);
        res.status(201).json({ message: "Centre creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant centre" });
    }
}

async function update(req, res) {
    try {
        const affected = await repo.update(req.params.id, req.body);
        if (affected === 0) return res.status(404).json({ message: "Centre no trobat" });
        res.json({ message: "Centre actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant centre" });
    }
}

async function remove(req, res) {
    try {
        const affected = await repo.remove(req.params.id);
        if (affected === 0) return res.status(404).json({ message: "Centre no trobat" });
        res.json({ message: "Centre eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant centre" });
    }
}

module.exports = { getAll, getById, search, create, update, remove };
