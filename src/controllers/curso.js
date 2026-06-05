const cursoRepository = require("../repositories/curso");

//GET: /pais
async function getAllcurso(req, res) {
    try {
        const curso = await cursoRepository.getAll();

        res.status(200).json(curso);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llista de Cursos"
        });
    }
}

//GET: /pais/:id
async function getCursoById(req, res) {
    try {
        const { id } = req.params;

        const curso = await cursoRepository.getById(id);

        if (!curso) {
            return res.status(404).json({
                message: "Curs no trobat"
            });
        }

        res.status(200).json(curso);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint curs"
        });
    }
}

module.exports = {
    getAllcurso,
    getCursoById
};