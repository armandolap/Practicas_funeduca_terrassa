const centreActivitatsRepository = require("../repositories/centre_activitats");

async function getAll(req, res) {
    try {
        const centres = await centreActivitatsRepository.getAll();
        res.status(200).json(centres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint centres d'activitats" });
    }
}

async function search(req, res) {
    try {
        const { q, idcallejero, nom_carrer } = req.query;
        const centres = await centreActivitatsRepository.search({ q, idcallejero, nom_carrer });
        res.status(200).json(centres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cercant centres d'activitats" });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const centre = await centreActivitatsRepository.getById(id);

        if (!centre) {
            return res.status(404).json({ message: "Centre d'activitats no trobat" });
        }

        res.status(200).json(centre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint centre d'activitats" });
    }
}

async function create(req, res) {
    try {
        const { nom_centre_activitats, direccio_idDireccio } = req.body;
        const id = await centreActivitatsRepository.create({ nom_centre_activitats, direccio_idDireccio });
        res.status(201).json({ message: "Centre d'activitats creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant centre d'activitats" });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { nom_centre_activitats, direccio_idDireccio } = req.body;
        const affectedRows = await centreActivitatsRepository.update(id, { nom_centre_activitats, direccio_idDireccio });

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Centre d'activitats no trobat" });
        }

        res.status(200).json({ message: "Centre d'activitats actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant centre d'activitats" });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const affectedRows = await centreActivitatsRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Centre d'activitats no trobat" });
        }

        res.status(200).json({ message: "Centre d'activitats eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant centre d'activitats" });
    }
}

module.exports = { getAll, search, getById, create, update, remove };
