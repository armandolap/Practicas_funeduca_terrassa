const repo = require("../repositories/projectes");

async function getAllProjectes(req, res) {
    try {
        const { filter = "todos", q = "", responsable_id } = req.query;
        const items = await repo.getAll(filter, q, responsable_id);
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint projectes" });
    }
}

async function getProjectesByCentre(req, res) {
    try {
        const { q = "" } = req.query;
        const items = await repo.getAll("todos", q, null, req.params.id);
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint projectes del centre" });
    }
}

async function getProjectesById(req, res) {
    try {
        const projecte = await repo.getById(req.params.id);
        if (!projecte) return res.status(404).json({ message: "Projecte no trobat" });
        const participants = await repo.getParticipants(req.params.id);
        projecte.participants = participants;
        res.json(projecte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint projecte" });
    }
}

async function createProject(req, res) {
    try {
        const projecte = req.body.projecte || {};
        const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, responsable } = projecte;

        if (!Nom_projecte?.trim()) return res.status(400).json({ message: "El nom del projecte és obligatori." });
        if (!idcentre_activitats) return res.status(400).json({ message: "idcentre_activitats és obligatori." });

        const newId = await repo.create({ Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats });
        if (responsable) await repo.setResponsable(newId, responsable);

        res.status(201).json({ message: "Projecte creat correctament", id: newId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant projecte" });
    }
}

async function updateProject(req, res) {
    try {
        const projecte = req.body.projecte || {};
        const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, responsable } = projecte;

        const existing = await repo.getById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Projecte no trobat" });

        if (!Nom_projecte?.trim()) return res.status(400).json({ message: "El nom del projecte és obligatori." });
        if (!idcentre_activitats) return res.status(400).json({ message: "idcentre_activitats és obligatori." });

        await repo.update(req.params.id, { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats });

        if (responsable) await repo.setResponsable(req.params.id, responsable);

        res.json({ message: "Projecte actualitzat correctament" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant projecte" });
    }
}

async function deleteProject(req, res) {
    try {
        const affected = await repo.remove(req.params.id);
        if (affected === 0) return res.status(404).json({ message: "Projecte no trobat" });
        res.json({ message: "Projecte eliminat correctament" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant projecte" });
    }
}

async function addClients(req, res) {
    try {
        const { clientIds } = req.body;
        const affected = await repo.addClients(req.params.id, clientIds);
        res.json({ message: `${affected} clients afegits` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error afegint clients" });
    }
}

async function removeClient(req, res) {
    try {
        const affected = await repo.removeClient(req.params.id, req.params.idClient);
        if (affected === 0) return res.status(404).json({ message: "Client no trobat al projecte" });
        res.json({ message: "Client eliminat del projecte" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant client del projecte" });
    }
}

module.exports = { getAllProjectes, getProjectesById, getProjectesByCentre, createProject, updateProject, deleteProject, addClients, removeClient };
