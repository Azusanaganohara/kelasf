const { model, Schema } = require("mongoose");

module.exports = model("Mahasiswa", new Schema({
    npm: String,
    nama: String,
    username: String,
}))