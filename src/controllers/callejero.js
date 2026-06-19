const callejeroRepository = require("../repositories/callejero");

async function searchCallejero(req, res) {
    try {
        const { tipus_via, q, nom_calle, idBarri, idCodi_postal, idCodiPostal } = req.query;
        const result = await callejeroRepository.search({ tipus_via, q, nom_calle, idBarri, idCodi_postal: idCodi_postal || idCodiPostal });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cercant carrers" });
    }
}

async function createCallejero(req, res) {
    try {
        const { idTipus_via, Nom_calle, idBarri, idCodi_postal } = req.body;
        if (!Nom_calle?.trim()) return res.status(400).json({ message: "Nom del carrer obligatori" });
        if (!idTipus_via) return res.status(400).json({ message: "Tipus de via obligatori" });
        const id = await callejeroRepository.create({ idTipus_via, Nom_calle, idBarri, idCodi_postal });
        res.status(201).json({ id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant carrer" });
    }
}

async function getCallejeroById(req, res) {
    try {
        const { id } = req.params;
        const result = await callejeroRepository.getById(id);
        if (!result) {
            return res.status(404).json({ message: "Carrer no trobat" });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint carrer" });
    }
}

module.exports = {
    searchCallejero,
    getCallejeroById,
    createCallejero
};
