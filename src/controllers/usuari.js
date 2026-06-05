const usuarioRepository = require("../repositories/usuari");

//GET /usuario
async function getAllUsuarios(req, res) {
    try {
        const usuarios = await usuarioRepository.getAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

//GET /usuario/:id
async function getUsuarioById(req, res) {
    try {
        const usuario = await usuarioRepository.getById(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                error: "Usuari no trobat"
            });
        }

        res.json(usuario);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

//Post /usuario
async function createUsuario(req, res) {
    try {

        const { Rol_usuario } = req.body;

        if (!Rol_usuario) {
            return res.status(400).json({
                error: "Rol usuari és obligatori"
            });
        }

        const id = await usuarioRepository.create(Rol_usuario);

        res.status(201).json({
            message: "Usuari creat",
            id
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

//PUT /usuario/:id
async function updateUsuario(req, res) {
    try {

        const { Rol_usuario } = req.body;

        const affectedRows = await usuarioRepository.update(
            req.params.id,
            Rol_usuario
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                error: "Usuari no trobat"
            });
        }

        res.json({
            message: "Usuari actualitzat"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

//DELETE /usuario/:id
async function removeUsuario(req, res) {
    try {

        const affectedRows = await usuarioRepository.remove(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).json({
                error: "Usuari no trobat"
            });
        }

        res.json({
            message: "Usuari eliminat"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

module.exports = {
    getAllUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    removeUsuario
};