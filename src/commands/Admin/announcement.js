const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const config = require("../../config");
const moment = require("moment-timezone");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Membuat pesan pengumuman yang akan ditampilkan kepada publik.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) => option
            .setName('message').setDescription('Pesan yang akan ditampilkan kepada publik dalam pesan pengumuman.').setRequired(true))
        .addChannelOption((channel) => channel
            .setName('channel').setDescription('Saluran tempat pesan pengumuman akan dikirimkan.').setRequired(true).addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews, ChannelType.AnnouncementThread])),

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`Pesan pengumuman berhasil dikirimkan ke ${channel}`)
                .setColor(config.embed.color)], ephemeral: true
        }).then(async () => {
            const Embed = new EmbedBuilder()
                .setTitle(interaction.guild.name)
                .setDescription(`${message.replace(/\\n/g, '\n')}\n\nSalam,\n<@!${interaction.user.id}>`)
                .setColor(config.embed.color)
                .setFooter({ text: `Pesan pengumuman ini dikirim pada ${moment(Date.now()).tz('Asia/Jakarta').format('DD MMMM YYYY HH:mm:ss A')}` })

            return channel.send({
                content: `||@everyone||`,
                embeds: [Embed]
            });
        });
    }
}
