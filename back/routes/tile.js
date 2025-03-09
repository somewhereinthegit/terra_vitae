const express = require("express");
const TileObservation = require("../models/TileObservation");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Observer une tuile spécifique
router.get("/observe", authMiddleware, async (req, res) => {
    try {
        const { row, col, plateauId } = req.query;
        const observation = await TileObservation.findOne({ row, col, plateauId });

        if (!observation) {
            return res.json({ message: "Vous n’observez rien de particulier ici." });
        }

        res.json({ message: observation.message });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
