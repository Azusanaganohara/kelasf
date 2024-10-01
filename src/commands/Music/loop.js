const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the loop mode for music playback on this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption((option) => option
            .setName('type').setDescription('Type of loop mode that you want to use in this action.').setRequired(true)
            .addChoices(
                { name: 'Disable', value: 'disable' },
                { name: 'Track', value: 'track' },
                { name: 'Queue', value: 'queue' },
            )),

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

        const type = options.getString('type')

        switch (type) {
            case 'disable': {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Successfully disabled loop mode for current playback.`)
                        .setColor(config.embed.color)], ephemeral: true
                }).then(async () => {
                    if (player.queueRepeat) {
                        player.setQueueRepeat(false);
                    } else if (player.trackRepeat) {
                        player.setTrackRepeat(false);
                    }
                });
            }
                break;
            case 'track': {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Successfully enabled loop mode for music on current playback.`)
                        .setColor(config.embed.color)], ephemeral: true
                }).then(async () => {
                    await player.setTrackRepeat(!player.trackRepeat);
                    if (player.trackRepeat) {
                        player.setQueueRepeat(false);
                    }
                });
            }
                break;
            case 'queue': {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Successfully enabled loop mode for queue on current playback.`)
                        .setColor(config.embed.color)], ephemeral: true
                }).then(async () => {
                    await player.setQueueRepeat(!player.queueRepeat);
                    if (player.trackRepeat) {
                        player.setTrackRepeat(false);
                    }
                });
            }
                break;
        }
    }
}