const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config");
const translate = require('translate-google');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ani-list')
        .setDescription('Untuk cari anime')
        .addStringOption(option => 
            option.setName('judul')
                .setDescription('Cari judul anime')
                .setRequired(true)),
    async execute(interaction) {
        const judul = interaction.options.getString('judul');

        const query = `
            query ($search: String) {
                Media (search: $search, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    description
                    startDate {
                        year
                        month
                        day
                    }
                    coverImage {
                        large
                    }
                    bannerImage
                    status
                    episodes
                }
            }
        `;

        const variables = {
            search: judul
        };

        try {
            const response = await axios.post('https://graphql.anilist.co', {
                query: query,
                variables: variables
            });
            
            const anime = response.data.data.Media;
            const cleanDescription = anime.description ? anime.description.replace(/<br>/g, '\n') : 'Deskripsi tidak tersedia.';
            const terjemahan = await translate (cleanDescription, { to: 'id' });
            const animeEmbed = new EmbedBuilder()
                .setColor(config.embed.color)
                .setTitle(anime.title.romaji || anime.title.english || anime.title.native)
                .setDescription(`** ${terjemahan}**`)
                .setThumbnail(anime.coverImage.large)
                .setImage(anime.bannerImage)
                .addFields(
                    { name: 'Judul Inggris', value: anime.title.english || 'N/A', inline: true },
                    { name: 'Judul Romaji', value: anime.title.romaji || 'N/A', inline: true },
                    { name: 'Judul Asli', value: anime.title.native || 'N/A', inline: true },
                    { name: 'Tanggal Rilis', value: `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}`, inline: true },
                    { name: 'Status', value: anime.status, inline: true },
                    { name: 'Jumlah Episode', value: `${anime.episodes}`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [animeEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply('Terjadi kesalahan saat mencari anime. Silakan coba lagi nanti.');
        }
    }
};
