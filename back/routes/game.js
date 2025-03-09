const express = require("express");
const GameSave = require("../models/GameSave");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Charger la sauvegarde d'une partie
router.get("/load", authMiddleware, async (req, res) => {
    try {
        const gameSave = await GameSave.findOne({ userId: req.user.userId });
        if (!gameSave) return res.status(404).json({ error: "Sauvegarde introuvable" });

        res.json(gameSave);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Sauvegarder la partie
router.post("/save", authMiddleware, async (req, res) => {
    try {
        const { gameId, playerPosition, exploredTiles } = req.body;
        await GameSave.updateOne(
            { userId: req.user.userId, gameId },
            { $set: { playerPosition, exploredTiles } },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
