const { model, Schema } = require("mongoose");

module.exports = model("jadwal", new Schema({
    Matkul: String,
    Hari: String,
    Jam: String
}));