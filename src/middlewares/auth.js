const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "funeduca-secret-key";

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionat" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invàlid o expirat" });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "No autenticat" });
        }

        if (!roles.includes(req.user.idNivel_acceso)) {
            return res.status(403).json({ message: "No tens permisos per accedir a aquest recurs" });
        }

        next();
    };
}

function requireTotal(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "No autenticat" });
    }

    if (req.user.idNivel_acceso !== 1) {
        return res.status(403).json({ message: "No tens permisos per accedir a aquest recurs" });
    }

    next();
}

module.exports = { requireAuth, requireRole, requireTotal };
