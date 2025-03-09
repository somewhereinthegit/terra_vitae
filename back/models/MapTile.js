const mongoose = require("mongoose");

const MapTileSchema = new mongoose.Schema({
    plateauId: { type: String, required: true },
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    textureUrl: { type: String, required: true },
    object: {
        type: { type: String, enum: ["ressource", "bâtiment"], default: null },
        name: { type: String },
        textureUrl: { type: String }
    }
});

module.exports = mongoose.model("MapTile", MapTileSchema);
