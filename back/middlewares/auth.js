const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET; // Clé secrète pour signer les tokens

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentification requise" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Ajoute l'ID de l'utilisateur dans `req.user`
        next(); // Passe à la prochaine fonction middleware
    } catch (err) {
        return res.status(403).json({ error: "Token invalide ou expiré" });
    }
}

module.exports = authMiddleware;
