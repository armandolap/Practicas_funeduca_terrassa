const genereRepository = require("../repositories/genere");

async function getAllGenere(req, res) {
    try {
        const items = await genereRepository.getAll();
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obtenint gèneres" });
    }
}

async function getGenereById(req, res) {
    try {
        const { id } = req.params;
        const item = await genereRepository.getById(id);
        if (!item) return res.status(404).json({ message: "Gènere no trobat" });
        res.status(200).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obtenint gènere" });
    }
}

module.exports = { getAllGenere, getGenereById };
