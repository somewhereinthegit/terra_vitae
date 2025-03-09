const mongoose = require("mongoose");

const TileObservationSchema = new mongoose.Schema({
    plateauId: { type: String, required: true },
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    message: { type: String, required: true }
});

module.exports = mongoose.model("TileObservation", TileObservationSchema);
