const mongoose = require("mongoose");

const GameSaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gameId: { type: String, required: true, unique: true },
    playerPosition: { row: Number, col: Number },
    exploredTiles: [{ row: Number, col: Number }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameSave", GameSaveSchema);
