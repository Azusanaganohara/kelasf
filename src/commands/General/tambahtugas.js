const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Homework = require("../../database/tugas"); 
const moment = require("moment-timezone");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tugas')
        .setDescription('Untuk menambah tugas yang ada')
        .addStringOption(option => 
            option.setName('nama_matkul')
                .setDescription('Tambahkan nama matkul yang di input')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('tanggal')
                .setDescription('Tambahkan tanggal tenggat (format: DD-MM-YYYY)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('jam')
                .setDescription('Tambahkan jam tenggat (format: HH:mm)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('link')
                .setDescription('Masukkan link dimana tempat setornya')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('catatan')
                .setDescription('Masukkan catatan untuk tugas tersebut')
                .setRequired(false)),

    async execute(interaction) {
        const matkul = interaction.options.getString('nama_matkul');
        const tanggal = interaction.options.getString('tanggal'); 
        const jam = interaction.options.getString('jam');
        const link = interaction.options.getString('link');
        const catatan = interaction.options.getString('catatan') || "Tidak ada catatan.";

        const dueDate = moment.tz(`${tanggal} ${jam}`, "DD-MM-YYYY HH:mm", "Asia/Jakarta").format();

        try {
            const tugasBaru = new Homework({
                Matkul: matkul,
                Tanggal: tanggal, 
                Jam: jam,
                Link: link,
                Catatan: catatan
            });

            await tugasBaru.save();

            const embed = new EmbedBuilder()
                .setTitle('Tugas Berhasil Ditambahkan')
                .setColor(config.embed.color) 
                .addFields(
                    { name: 'Mata Kuliah', value: matkul, inline: true },
                    { name: 'Tanggal', value: tanggal, inline: true }, 
                    { name: 'Jam', value: jam, inline: true },
                    { name: 'Link', value: link, inline: true },
                    { name: 'Catatan', value: catatan, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat menyimpan tugas.', ephemeral: true });
        }
    }
};
