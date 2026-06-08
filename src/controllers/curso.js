const cursoRepository = require("../repositories/curso");

//GET: /curso
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

//GET: /curso/:id
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

// POST /curso
async function createCurso(req, res) {
    try {
        const { Nom } = req.body;

        if (!Nom) {
            return res.status(400).json({
                message: "El nom del curs és obligatori"
            });
        }

        const id = await cursoRepository.create(Nom);

        res.status(201).json({
            message: "Curs creat",
            id
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creant curs"
        });
    }
}

// PUT /curso/:id
async function updateCurso(req, res) {
    try {
        const { id } = req.params;
        const { Nom } = req.body;

        const affectedRows = await cursoRepository.update(id, Nom);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Curs no trobat"
            });
        }

        res.status(200).json({
            message: "Curs actualitzat"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error actualitzant curs"
        });
    }
}

// DELETE /curso/:id
async function deleteCurso(req, res) {
    try {
        const { id } = req.params;

        const affectedRows = await cursoRepository.remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Curs no trobat"
            });
        }

        res.status(200).json({
            message: "Curs eliminat"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error eliminant curs"
        });
    }
}
module.exports = {
    getAllcurso,
    getCursoById,
    createCurso,
    updateCurso,
    deleteCurso
};