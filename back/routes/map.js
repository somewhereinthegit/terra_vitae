const express = require("express");
const MapTile = require("../models/MapTile");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Charger la carte d’un plateau spécifique
router.get("/:plateauId", authMiddleware, async (req, res) => {
    try {
        const plateauId = req.params.plateauId;
        const tiles = await MapTile.find({ plateauId });

        if (!tiles.length) {
            return res.status(404).json({ error: "Aucune tuile trouvée pour ce plateau." });
        }

        res.json({
            plateauId,
            rows: Math.max(...tiles.map(t => t.row)) + 1,
            cols: Math.max(...tiles.map(t => t.col)) + 1,
            tiles
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
