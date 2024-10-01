const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the music playback volume on this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addNumberOption((option) => option
            .setName('number').setDescription('Enter a number to adjust the music playback volume.').setRequired(true)),

    async execute(interaction, client) {
        const { options } = interaction;
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

        const volume = options.getNumber('number')

        if (!volume || volume < 1 || volume > 100) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`You can only adjust the music playback volume between 1% and 100%.`)
                .setColor(config.embed.color)], ephemeral: true
        })

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`Successfully set the music playback volume at ${volume}%.`)
                .setColor(config.embed.color)], ephemeral: true
        }).then(async () => {
            await player.setVolume(volume);
        });
    }
}