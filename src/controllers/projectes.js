const projectesRepository = require("../repositories/projectes");

async function getAllProjectes(req, res) {
    try {
        const { filter, q } = req.query;
        const projectes = await projectesRepository.getAll({ filter, q });
        res.status(200).json(projectes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error obtenint llistat de projectes"
        });
    }
}

async function getProjectesById(req, res) {
    try {
        const { id } = req.params;
        const projecte = await projectesRepository.getById(id);

        if (!projecte) {
            return res.status(404).json({
                message: "Projecte no trobat"
            });
        }

        res.status(200).json(projecte);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error obtenint projecte"
        });
    }
}

async function createProject(req, res) {
    try {
        const projecte = req.body.projecte || {};

        const {
            Nom_projecte,
            Descripcio = null,
            plazas = 0,
            fecha_inicio_act = null,
            fecha_fin_act = null,
            idcentre_activitats
        } = projecte;

        if (!Nom_projecte?.trim()) {
            return res.status(400).json({
                message: "El nom del projecte és obligatori."
            });
        }

        if (!idcentre_activitats) {
            return res.status(400).json({
                message: "idcentre_activitats és obligatori."
            });
        }

        const nuevoProjecteId = await projectesRepository.create({
            Nom_projecte,
            Descripcio,
            plazas,
            fecha_inicio_act,
            fecha_fin_act,
            idcentre_activitats
        });

        res.status(201).json({
            message: "Projecte creat correctament",
            id: nuevoProjecteId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creant projecte"
        });
    }
}

async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const projecte = req.body.projecte || {};

        const {
            Nom_projecte,
            Descripcio = null,
            plazas = 0,
            fecha_inicio_act = null,
            fecha_fin_act = null,
            idcentre_activitats,
            responsable
        } = projecte;

        if (!Nom_projecte?.trim()) {
            return res.status(400).json({
                message: "El nom del projecte és obligatori."
            });
        }

        if (!idcentre_activitats) {
            return res.status(400).json({
                message: "idcentre_activitats és obligatori."
            });
        }

        const affectedRows = await projectesRepository.update(id, {
            Nom_projecte,
            Descripcio,
            plazas,
            fecha_inicio_act,
            fecha_fin_act,
            idcentre_activitats
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Projecte no trobat"
            });
        }

        if (responsable) {
            await projectesRepository.setResponsable(id, responsable);
        }

        res.status(200).json({
            message: "Projecte actualitzat correctament"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error actualitzant projecte"
        });
    }
}

async function deleteProject(req, res) {
    try {
        const { id } = req.params;
        const affectedRows = await projectesRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Projecte no trobat"
            });
        }

        res.status(200).json({
            message: "Projecte eliminat correctament"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error eliminant projecte"
        });
    }
}

async function addClientsToProject(req, res) {
    try {
        const { id } = req.params;
        const { clientIds } = req.body;

        if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
            return res.status(400).json({
                message: "clientIds és obligatori i ha de ser un array."
            });
        }

        await projectesRepository.addClients(id, clientIds);

        res.status(200).json({
            message: "Clients afegits correctament al projecte"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error afegint clients al projecte"
        });
    }
}

async function removeClientFromProject(req, res) {
    try {
        const { id, idClient } = req.params;
        await projectesRepository.removeClient(id, idClient);

        res.status(200).json({
            message: "Client eliminat del projecte correctament"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error eliminant client del projecte"
        });
    }
}

module.exports = {
    getAllProjectes,
    getProjectesById,
    createProject,
    updateProject,
    deleteProject,
    addClientsToProject,
    removeClientFromProject
};
