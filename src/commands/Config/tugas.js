const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const moment = require("moment-timezone");
const Conftugas = require("../../database/conftugas");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tugasconfig')
        .setDescription('Konfigurasi pengingat tugas di channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Aktifkan pengingat tugas di channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Pilih channel untuk mengaktifkan pengingat tugas')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Nonaktifkan pengingat tugas di channel')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'enable') {
            const channel = interaction.options.getChannel('channel');
    
            if (!channel || !(channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement)) {
                return interaction.reply({ content: `Channel yang dipilih bukan channel teks yang valid.`, ephemeral: true });
            }

            try {
                const existingConfig = await Conftugas.findOne({ guildId: interaction.guild.id });
    
                if (existingConfig) {
                    existingConfig.channelId = channel.id;
                    existingConfig.channelName = channel.name;
                    existingConfig.updatedAt = moment().tz("Asia/Jakarta").toDate();
                    await existingConfig.save();
    
                    const embed = new EmbedBuilder()
                        .setTitle("Konfigurasi Tugas Diperbarui")
                        .setDescription(`Pengingat tugas telah diaktifkan di channel **${channel.name}**`)
                        .setColor(0x00FF00)
                        .setTimestamp();
    
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    await Conftugas.create({
                        guildId: interaction.guild.id,
                        channelId: channel.id,
                        channelName: channel.name,
                        createdAt: moment().tz("Asia/Jakarta").toDate()
                    });
    
                    const embed = new EmbedBuilder()
                        .setTitle("Konfigurasi Tugas Dibuat")
                        .setDescription(`Pengingat tugas telah diaktifkan di channel **${channel.name}**`)
                        .setColor(0x00FF00)
                        .setTimestamp();
    
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } catch (error) {
                console.error("Terjadi kesalahan saat menyimpan konfigurasi tugas:", error);
                return interaction.reply({ content: "Terjadi kesalahan saat menyimpan konfigurasi.", ephemeral: true });
            }
        } else if (subcommand === 'disable') {
            try {
                const existingConfig = await Conftugas.findOne({ guildId: interaction.guild.id });

                if (existingConfig) {
                    await existingConfig.deleteOne(); 

                    const embed = new EmbedBuilder()
                        .setTitle("Konfigurasi Tugas Dinonaktifkan")
                        .setDescription("Pengingat tugas telah dinonaktifkan di server ini.")
                        .setColor(0xFF0000)
                        .setTimestamp();

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    return interaction.reply({ content: "Belum ada pengingat tugas yang diaktifkan di server ini.", ephemeral: true });
                }
            } catch (error) {
                console.error("Terjadi kesalahan saat menonaktifkan konfigurasi tugas:", error);
                return interaction.reply({ content: "Terjadi kesalahan saat menonaktifkan konfigurasi.", ephemeral: true });
            }
        }
    }
};
