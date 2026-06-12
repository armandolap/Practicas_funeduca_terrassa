const clientRepository = require("../repositories/client");

// GET /client
async function getAllClients(req, res) {
    try {
        const clients = await clientRepository.getAll();

        res.status(200).json(clients);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint clients"
        });
    }
}

// GET /client/:id
async function getClientById(req, res) {
    try {
        const { id } = req.params;

        const client = await clientRepository.getById(id);

        if (!client) {
            return res.status(404).json({
                message: "Client no trobat"
            });
        }

        res.status(200).json(client);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint client"
        });
    }
}

// POST /client
async function createClient(req, res) {
    try {
        const clientData = req.body;

        const id = await clientRepository.create(clientData);

        res.status(201).json({
            message: "Client creat",
            id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creant client"
        });
    }
}

// PUT /client/:id
async function updateClient(req, res) {
    try {
        const { id } = req.params;
        const clientData = req.body;

        const affectedRows = await clientRepository.update(id, clientData);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Client no trobat"
            });
        }

        res.status(200).json({
            message: "Client actualitzat"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error actualitzant client"
        });
    }
}

// DELETE /client/:id
async function deleteClient(req, res) {
    try {
        const { id } = req.params;

        const affectedRows = await clientRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Client no trobat"
            });
        }

        res.status(200).json({
            message: "Client eliminat"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error eliminant client"
        });
    }
}

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
};
