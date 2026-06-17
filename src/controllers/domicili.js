const domiciliRepository = require("../repositories/domicili");

async function getAllDomicilis(req, res) {
    try {
        const { barri, tipus, offset, limit } = req.query;
        const domicilis = await domiciliRepository.getAll({ barri, tipus, offset, limit });
        res.status(200).json(domicilis);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error obtenint domicilis"
        });
    }
}

async function getDomiciliById(req, res) {
    try {
        const { id } = req.params;
        const domicili = await domiciliRepository.getByIdEnhanced(id);
        if (!domicili) {
            return res.status(404).json({
                message: "Domicili no trobat"
            });
        }
        res.status(200).json(domicili);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error obtenint domicili"
        });
    }
}

async function createDomicili(req, res) {
    try {
        const {
            Tipus_domicili,
            Direccio
        } = req.body;

        const id = await domiciliRepository.create(
            Tipus_domicili,
            Direccio
        );

        res.status(201).json({
            message: "Domicili creat",
            id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creant domicili"
        });
    }
}

async function updateDomicili(req, res) {
    try {
        const { id } = req.params;

        const {
            Tipus_domicili,
            Direccio
        } = req.body;

        const affectedRows =
            await domiciliRepository.update(
                id,
                Tipus_domicili,
                Direccio
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Domicili no trobat"
            });
        }

        res.status(200).json({
            message: "Domicili actualitzat"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error actualitzant domicili"
        });
    }
}

async function deleteDomicili(req, res) {
    try {
        const { id } = req.params;

        const affectedRows =
            await domiciliRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Domicili no trobat"
            });
        }

        res.status(200).json({
            message: "Domicili eliminat"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error eliminant domicili"
        });
    }
}

async function getDomicilisByFamily(req, res) {
    try {
        const { idFamilia } = req.params;

        const domicilis = await domiciliRepository.getByFamily(idFamilia);

        res.status(200).json(domicilis);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint domicilis de la família"
        });
    }
}

async function searchDomicilisCarrer(req, res) {
    try {
        const { q, tipus_via, idFamilia } = req.query;

        const results = await domiciliRepository.searchCombined({
            q: q || "",
            tipus_via: tipus_via || null,
            idFamilia: idFamilia || null
        });

        res.status(200).json(results);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error cercant domicilis i carrers"
        });
    }
}

module.exports = {
    getAllDomicilis,
    getDomiciliById,
    createDomicili,
    updateDomicili,
    deleteDomicili,
    getDomicilisByFamily,
    searchDomicilisCarrer
};
