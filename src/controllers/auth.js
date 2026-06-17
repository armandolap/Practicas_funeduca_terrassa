const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createPool } = require("../config/database");
const { JWT_SECRET } = require("../middlewares/auth");

const pool = createPool();

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "Email i contrasenya obligatoris" });
        }

        const [rows] = await pool.query(
            `SELECT idUsuario_APP, idNivel_acceso, Nom, Cognoms, email, password
             FROM usuario_app WHERE email = ?`,
            [email.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Credencials invàlides" });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Credencials invàlides" });
        }

        const token = jwt.sign(
            {
                idUsuario_APP: user.idUsuario_APP,
                idNivel_acceso: user.idNivel_acceso,
                Nom: user.Nom,
                Cognoms: user.Cognoms,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            token,
            user: {
                idUsuario_APP: user.idUsuario_APP,
                idNivel_acceso: user.idNivel_acceso,
                Nom: user.Nom,
                Cognoms: user.Cognoms,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al iniciar sessió" });
    }
}

async function me(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT idUsuario_APP, idNivel_acceso, Nom, Cognoms, email, Telefon
             FROM usuario_app WHERE idUsuario_APP = ?`,
            [req.user.idUsuario_APP]
        );
        if (rows.length === 0) return res.status(404).json({ message: "Usuari no trobat" });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error" });
    }
}

module.exports = { login, me };
