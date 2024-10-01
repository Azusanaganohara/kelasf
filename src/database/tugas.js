const { model, Schema } = require("mongoose");

module.exports = model("Homework", new Schema({
    Matkul: String,
    Tanggal: String,
    Jam: String,
    Link: String,
    Catatan: String,
    CreatedAt: { type: Date, default: Date.now }, 
}));
