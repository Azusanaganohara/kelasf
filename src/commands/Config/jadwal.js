const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../config");
const moment = require("moment-timezone");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jadwal')
        .setDescription('Buat mengaktifkan jadwal di channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addMentionableOption(option => 
            option.setName('channel')
                .setDescription('di channel mana?')
                .setRequired(true)) 
}