const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth");

const JWT_SECRET = process.env.JWT_SECRET || "funeduca-secret-key";

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email i contrasenya obligatoris" });
        }

        const user = await authRepository.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Credencials invàlides" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Credencials invàlides" });
        }

        const tokenPayload = {
            idUsuario_APP: user.idUsuario_APP,
            idNivel_acceso: user.idNivel_acceso,
            Nom: user.Nom,
            Cognoms: user.Cognoms
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });

        res.status(200).json({
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

module.exports = { login };
