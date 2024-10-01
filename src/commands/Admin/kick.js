const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const config = require("../../config");
const moment = require("moment-timezone");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Ngekick orang')
        .addMentionableOption(option => 
            option.setName('user')
                .setDescription('Siapa yang mau di kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Alasan makhluk ini di kick')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getMentionable('user');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan yang diberikan';
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply('Kamu tidak memiliki izin untuk menggunakan perintah ini.');
        }

        if (!user) {
            return interaction.reply('Kamu harus menyebutkan pengguna yang ingin di kick.');
        }

        if (!interaction.guild.members.cache.get(user.id).kickable) {
            return interaction.reply('Aku tidak bisa mengkick pengguna ini.');
        }

        const kickEmbed = new EmbedBuilder()
            .setColor(config.embed.color)
            .setTitle('Pengguna Dikick')
            .setImage('https://cdn.discordapp.com/attachments/1224778845001875466/1224797727129604138/Proyek_Baru_9_5FD74C0.png?ex=664af705&is=6649a585&hm=42e0bec904cee52f80a978777b814b174631eaffef9d853c9a3b9c8472ba697a&')
            .addFields(
                { name: 'Pengguna:', value: `${user}`, inline: true },
                { name: 'Oleh:', value: `${interaction.user}`, inline: true },
                { name: 'Alasan:', value: `${reason}`, inline: false },
                { name: 'Waktu:', value: `${moment().tz("Asia/Jakarta").format("LLLL")}`, inline: false }
            )
            .setTimestamp();

        await interaction.guild.members.kick(user, { reason });

        return interaction.reply({ embeds: [kickEmbed] });
    }
};
