const { model, Schema } = require("mongoose");

module.exports = model("Conftugas", new Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    channelName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }

}));
