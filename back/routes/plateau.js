const express = require("express");
const Plateau = require("../models/Plateau");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Récupérer la liste des plateaux disponibles
router.get("/list", authMiddleware, async (req, res) => {
    try {
        const plateaux = await Plateau.find();

        if (!plateaux.length) {
            return res.status(404).json({ error: "Aucun plateau disponible." });
        }

        res.json(plateaux);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
