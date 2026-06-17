const bcrypt = require("bcrypt");
const usuarioRepository = require("../repositories/usuari");

async function getAllUsuarios(req, res) {
    try {
        const { filter, q } = req.query;
        const usuarios = await usuarioRepository.getAll({ filter, q });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

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

async function createUsuario(req, res) {
    try {
        const { Nom, Cognoms, email, Telefon, idNivel_acceso, password } = req.body;

        if (!Nom || !Cognoms || !email || !Telefon || !idNivel_acceso || !password) {
            return res.status(400).json({
                error: "Tots els camps són obligatoris: Nom, Cognoms, email, Telefon, idNivel_acceso, password"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const id = await usuarioRepository.create({
            Nom,
            Cognoms,
            email,
            Telefon,
            idNivel_acceso,
            password: hashedPassword
        });

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

async function updateUsuario(req, res) {
    try {
        const { Nom, Cognoms, email, Telefon, idNivel_acceso, password } = req.body;
        const data = { Nom, Cognoms, email, Telefon, idNivel_acceso };

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const affectedRows = await usuarioRepository.update(req.params.id, data);

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

async function removeUsuario(req, res) {
    try {
        const result = await usuarioRepository.remove(req.params.id);

        if (result === false) {
            return res.status(400).json({
                error: "No es pot eliminar un usuari amb projectes assignats"
            });
        }

        if (!result) {
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
