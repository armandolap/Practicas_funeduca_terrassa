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

// GET /projectes/:id
async function getProjectesById(req, res) {
    try {
        const projecte = await repo.getById(req.params.id);
        if (!projecte) return res.status(404).json({ message: "Projecte no trobat" });
        projecte.participants = await repo.getParticipants(req.params.id);
        projecte.responsables = await repo.getResponsables(req.params.id);
        res.json(projecte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint projecte" });
    }
}

async function createProject(req, res) {
    try {
        const projecte = req.body.projecte || {};
        const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, responsable_zona, responsables_projecte, treballadors } = projecte;

        if (!Nom_projecte?.trim()) return res.status(400).json({ message: "El nom del projecte és obligatori." });
        if (!idcentre_activitats) return res.status(400).json({ message: "idcentre_activitats és obligatori." });
        if (Nom_projecte && Nom_projecte.length > 100) return res.status(400).json({ message: "El nom del projecte no pot superar 100 caràcters." });
        if (plazas !== undefined && plazas !== null) {
            if (typeof plazas !== "number" || !Number.isFinite(plazas) || plazas < 0) {
                return res.status(400).json({ message: "El nombre de places ha de ser un número positiu o zero." });
            }
        }

        const nomProj = Nom_projecte.trim();

        if (fecha_inicio_act && fecha_fin_act && fecha_fin_act < fecha_inicio_act) {
            return res.status(400).json({ message: "La data de finalització no pot ser anterior a la data d'inici." });
        }

        const newId = await repo.create({ Nom_projecte: nomProj, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats });
        await repo.syncResponsables(newId, responsable_zona, responsables_projecte, treballadors);

        res.status(201).json({ message: "Projecte creat correctament", id: newId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant projecte" });
    }
}

async function updateProject(req, res) {
    try {
        const projecte = req.body.projecte || {};
        const { Nom_projecte, Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats, responsable_zona, responsables_projecte, treballadors, responsables_projecte_add, treballadors_add } = projecte;

        const existing = await repo.getById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Projecte no trobat" });

        const userRole = req.user?.idNivel_acceso;
        if (userRole === 3) {
            const responsables = await repo.getResponsables(req.params.id);
            const isAssigned = responsables.some(r =>
                r.idUsuario_APP === req.user.idUsuario_APP && (r.tipus_responsable === 1 || r.tipus_responsable === 2)
            );
            if (!isAssigned) {
                return res.status(403).json({ message: "No tens permís per editar aquest projecte" });
            }
        } else if (userRole !== 1 && userRole !== 2) {
            return res.status(403).json({ message: "Permís denegat" });
        }

        if (!Nom_projecte?.trim()) return res.status(400).json({ message: "El nom del projecte és obligatori." });
        if (!idcentre_activitats) return res.status(400).json({ message: "idcentre_activitats és obligatori." });
        if (Nom_projecte && Nom_projecte.length > 100) return res.status(400).json({ message: "El nom del projecte no pot superar 100 caràcters." });
        if (plazas !== undefined && plazas !== null) {
            if (typeof plazas !== "number" || !Number.isFinite(plazas) || plazas < 0) {
                return res.status(400).json({ message: "El nombre de places ha de ser un número positiu o zero." });
            }
        }
        if (fecha_inicio_act && fecha_fin_act && fecha_fin_act < fecha_inicio_act) {
            return res.status(400).json({ message: "La data de finalització no pot ser anterior a la data d'inici." });
        }

        await repo.update(req.params.id, { Nom_projecte: Nom_projecte.trim(), Descripcio, plazas, fecha_inicio_act, fecha_fin_act, idcentre_activitats });

        if (userRole === 3) {
            await repo.addResponsables(req.params.id, responsables_projecte_add, treballadors_add);
        } else {
            await repo.syncResponsables(req.params.id, responsable_zona, responsables_projecte, treballadors);
        }

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
        if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
            return res.status(400).json({ message: "clientIds és obligatori i ha de ser un array no buit." });
        }
        const invalidIds = await repo.validateClientIds(clientIds);
        if (invalidIds.length > 0) {
            return res.status(400).json({ message: `Els següents IDs de client no existeixen: ${invalidIds.join(", ")}` });
        }
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

async function getUsuarisPerNivell(req, res) {
    try {
        const { min = 1, max = 5 } = req.query;
        const usuaris = await repo.getUsuarisByNivell(parseInt(min), parseInt(max));
        res.json(usuaris);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint usuaris" });
    }
}

module.exports = { getAllProjectes, getProjectesById, getProjectesByCentre, createProject, updateProject, deleteProject, addClients, removeClient, getUsuarisPerNivell };
