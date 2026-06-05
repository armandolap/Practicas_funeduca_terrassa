const Resul_acadRepository = require("../repositories/resul_acad");

//GET: /pais
async function getAllResul_acad(req, res) {
    try {
        const resul_acad = await Resul_acadRepository.getAll();

        res.status(200).json(resul_acad);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint possibles resultats acadèmics"
        });
    }
}

//GET: /pais/:id
async function getResul_acadById(req, res) {
    try {
        const { id } = req.params;

        const resul_acad = await Resul_acadRepository.getById(id);

        if (!resul_acad) {
            return res.status(404).json({
                message: "Resultat acadèmic no trobat"
            });
        }

        res.status(200).json(resul_acad);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint resultat acadèmic"
        });
    }
}

module.exports = {
    getAllResul_acad,
    getResul_acadById
};