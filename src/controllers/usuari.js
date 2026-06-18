const repo = require("../repositories/usuari");

async function getAllUsuarios(req, res) {
    try {
        const { filter = "tots", q = "" } = req.query;
        const usuarios = await repo.getAll(filter, q);
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function getUsuarioById(req, res) {
    try {
        const usuario = await repo.getById(req.params.id);
        if (!usuario) return res.status(404).json({ error: "Usuari no trobat" });
        const projectes = await repo.getProjectsByUser(req.params.id);
        const stats = {
            num_projectes: projectes.length,
            num_actius: projectes.filter(p => p.estat_projecte === 'actiu').length,
            num_futurs: projectes.filter(p => p.estat_projecte === 'futur').length,
            num_tancats: projectes.filter(p => p.estat_projecte === 'tancat').length,
        };
        res.json({ ...usuario, projectes, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function createUsuario(req, res) {
    try {
        const { idNivel_acceso, Nom, Cognoms, username, email, Telefon, password } = req.body;
        if (!idNivel_acceso) return res.status(400).json({ error: "Nivell d'accés obligatori" });
        if (!Nom?.trim()) return res.status(400).json({ error: "Nom obligatori" });
        if (!Cognoms?.trim()) return res.status(400).json({ error: "Cognoms obligatoris" });
        if (!username?.trim()) return res.status(400).json({ error: "Nom d'usuari obligatori" });
        if (!password?.trim()) return res.status(400).json({ error: "Contrasenya obligatòria" });
        const existing = await repo.findByUsername(username.trim());
        if (existing) return res.status(409).json({ error: "Aquest nom d'usuari ja existeix" });
        const id = await repo.create({ idNivel_acceso, Nom, Cognoms, username: username.trim(), email, Telefon, password });
        res.status(201).json({ message: "Usuari creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function updateUsuario(req, res) {
    try {
        const affected = await repo.update(req.params.id, req.body);
        if (affected === 0) return res.status(404).json({ error: "Usuari no trobat" });
        res.json({ message: "Usuari actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function removeUsuario(req, res) {
    try {
        const affected = await repo.remove(req.params.id);
        if (affected === 0) return res.status(404).json({ error: "Usuari no trobat" });
        res.json({ message: "Usuari eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllUsuarios, getUsuarioById, createUsuario, updateUsuario, removeUsuario };
