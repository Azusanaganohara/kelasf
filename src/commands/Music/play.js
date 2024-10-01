const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play the music you want with stable quality.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption((option) => option
            .setName('query').setDescription('Enter the link or title of the music from YouTube or Spotify that you want.').setRequired(true)),

    async execute(interaction, client) {
        const { options } = interaction;
        const { channel } = interaction.member.voice;

        if (!channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`You must enter the voice channel first to use this command.`)
                    .setColor(config.embed.color)], ephemeral: true
            });
        }

        const player = await client.manager.create({
            guild: interaction.guild.id,
            voiceChannel: channel.id,
            textChannel: interaction.channel.id,
            selfDeafen: true,
            volume: 75
        });

        await player.connect();

        const query = options.getString('query');

        if (!query) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`The query you entered does not match my search system.`)
                    .setColor(config.embed.color)], ephemeral: true
            });
        }

        let res;

        try {
            res = await player.search(query, interaction.user);
            if (res.loadType === 'LOAD_FAILED') {
                if (!player.queue.current) {
                    player.destroy();
                }
                throw res.exception;
            }
            if (res.loadType === 'NO_MATCHES') {
                throw new Error("No results found.");
            }
        } catch (err) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`There was an error while playing music.\n**Reason :** ${err.message}`)
                    .setColor(config.embed.color)], ephemeral: true
            });
        }

        switch (res.loadType) {
            case 'TRACK_LOADED':
            case 'SEARCH_RESULT':
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Successfully added **${res.tracks[0].title}**`)
                        .setColor(config.embed.color)], ephemeral: true
                }).then(async () => {
                    await player.queue.add(res.tracks[0]);
                    if (!player.playing && !player.paused && !player.queue.size) {
                        player.play();
                    }
                });
            case 'PLAYLIST_LOADED':
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Successfully added **${res.playlist.name}** with ${res.tracks.length} tracks`)
                        .setColor(config.embed.color)], ephemeral: true
                }).then(async () => {
                    await player.queue.add(res.tracks);
                    if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
                        player.play();
                    }
                });
            default:
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Cannot load music playback type : ${res.loadType}`)
                        .setColor(config.embed.color)], ephemeral: true
                });
        }
    }
};