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

        // Recalculate C_edad if Fecha_nacimiento provided
        if (clientData.Fecha_nacimiento) {
            const nac = new Date(clientData.Fecha_nacimiento);
            const avui = new Date();
            let edad = avui.getFullYear() - nac.getFullYear();
            const m = avui.getMonth() - nac.getMonth();
            if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) {
                edad--;
            }
            clientData.C_edad = edad;
        }

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

// POST /client/full
async function createFullClient(req, res) {
    try {
        const { client: clientData, familia, domicili } = req.body;

        if (!clientData) {
            return res.status(400).json({ message: "Dades de client obligatòries" });
        }

        const {
            Nom,
            Cognoms,
            Fecha_nacimiento,
            idGenere,
            Telefon,
            Correu_electronic,
            idRol,
            idSituacio_economica,
            Pais_naixement,
            derivacio_serveis_socials,
            Risc,
            Resultat_academic,
            Curs_actual,
            idSebas,
            idNecessitat_especial
        } = clientData;

        // Required fields
        if (!Nom?.trim()) return res.status(400).json({ message: "Nom obligatori" });
        if (!Cognoms?.trim()) return res.status(400).json({ message: "Cognoms obligatoris" });
        if (!Fecha_nacimiento) return res.status(400).json({ message: "Fecha naixement obligatòria" });
        if (!idGenere) return res.status(400).json({ message: "Gènere obligatori" });
        if (!idRol) return res.status(400).json({ message: "Rol obligatori" });
        if (!idSituacio_economica) return res.status(400).json({ message: "Situació econòmica obligatòria" });
        if (!Pais_naixement) return res.status(400).json({ message: "País naixement obligatori" });

        // Validate family/domicile structure
        if (!familia?.idFamilia && !familia?.Estructura_familiar) {
            return res.status(400).json({ message: "Estructura familiar obligatòria si no s'assigna una família existent" });
        }
        if (!domicili?.idDomicili && !domicili?.idcallejero) {
            return res.status(400).json({ message: "Dades de domicili obligatòries si no s'assigna un d'existent" });
        }

        // Calculate age from Fecha_nacimiento
        const nac = new Date(Fecha_nacimiento);
        const avui = new Date();
        let C_edad = avui.getFullYear() - nac.getFullYear();
        const m = avui.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) {
            C_edad--;
        }

        // Default IDs from static inserts (ordered as in inserts_tablas_estaticas.sql)
        const RISK_SENSE_RISC = 1;
        const SEBAS_NO_SEBAS = 12;
        const CURS_NO_APLICA = 26;

        const payload = {
            domicili: domicili || {},
            familia: {
                idFamilia: familia?.idFamilia || null,
                Cognom_familiar: familia?.Cognom_familiar || Cognoms,
                Estructura_familiar: familia?.Estructura_familiar || null
            },
            client: {
                Nom,
                Cognoms,
                Telefon: Telefon || null,
                Correu_electronic: Correu_electronic || null,
                Data_d_alta: new Date().toISOString().split("T")[0],
                C_temps_a_lentitat: "0",
                Fecha_nacimiento,
                C_edad,
                idGenere,
                idRol,
                idSituacio_economica,
                Pais_naixement,
                derivacio_serveis_socials: derivacio_serveis_socials ?? 0,
                Risc: Risc ?? RISK_SENSE_RISC,
                Resultat_academic: Resultat_academic ?? null,
                Curs_actual: Curs_actual ?? CURS_NO_APLICA,
                idSebas: idSebas ?? SEBAS_NO_SEBAS,
                idNecessitat_especial: idNecessitat_especial ?? null
            },
            nacionalitat: Pais_naixement
        };

        const id = await clientRepository.createFull(payload);

        res.status(201).json({
            message: "Client creat correctament",
            id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creant client complet"
        });
    }
}

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    createFullClient
};
