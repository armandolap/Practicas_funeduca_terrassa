const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "funeduca-secret-key-change-in-production";

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No autoritzat" });
    }
    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Token invàlid" });
    }
}

function requireRole(...roleIds) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "No autoritzat" });
        if (!roleIds.includes(req.user.idNivel_acceso)) {
            return res.status(403).json({ message: "Permís denegat" });
        }
        next();
    };
}

function requireTotal(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "No autoritzat" });
    if (req.user.idNivel_acceso !== 1) {
        return res.status(403).json({ message: "Permís denegat" });
    }
    next();
}

module.exports = { requireAuth, requireRole, requireTotal, JWT_SECRET };
