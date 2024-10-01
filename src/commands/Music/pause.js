const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause music playback on this server that is currently running.')
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

        try {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`Successfully pause the music playback that is currently running.`)
                    .setColor(config.embed.color)], ephemeral: true
            }).then(async () => {
                await player.pause(true);
            });
        } catch {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`Playback has now paused, you do not need to do this action again.`)
                    .setColor(config.embed.color)], ephemeral: true
            })
        }
    }
}