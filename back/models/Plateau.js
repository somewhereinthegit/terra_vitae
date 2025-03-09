const mongoose = require("mongoose");

const PlateauSchema = new mongoose.Schema({
    plateauId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    biome: { type: String },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true }
});

module.exports = mongoose.model("Plateau", PlateauSchema);
