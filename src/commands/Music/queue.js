const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays a queued list of music on playback on this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction, client) {
        const player = interaction.client.manager.get(interaction.guild.id)
        const channel = interaction.member.voice;

        if (!player) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`There is no music playing on this server.`)
                .setColor(config.embed.color)], ephemeral: true
        });

        if (!channel) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`You must enter the voice channel first to use this command.`)
                .setColor(config.embed.color)], ephemeral: true
        });

        if (!channel.id == player.voiceChannel) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`You must be on or logged in to the same voice channel as me.`)
                .setColor(config.embed.color)], ephemeral: true
        });

        if (!player.queue.current) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`There is no music playing at the moment.`)
                .setColor(config.embed.color)], ephemeral: true
        });

        const queue = await player.queue;
        const Embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}'s Queue`)
            .setColor(config.embed.color)

        const multiple = 10;
        const page = 1

        const end = page * multiple;
        const start = end - multiple;

        const tracks = queue.slice(start, end);

        if (queue.current) Embed.addFields([
            { name: 'Current Playing', value: `${queue.current.title}\nRequested by ${queue.current.requester}`, inline: false }
        ])

        if (!tracks.length) Embed.setDescription(`There is no music in the queue on this server!`)
        else Embed.setDescription(`${tracks.map((track, i) => `**${start + (++i)}.** ${track.title} by ${track.author}`).join("\n")}\n*and ${queue.length - 10} more...*`)

        Embed.setFooter({ text: `This server has music in a queue of ${queue.length} music` })
        Embed.setImage(`https://img.youtube.com/vi/${queue.current.identifier}/mqdefault.jpg`)

        return interaction.reply({ embeds: [Embed], ephemeral: true })
    }
}