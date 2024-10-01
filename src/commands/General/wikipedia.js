const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wikipedia')
        .setDescription('Mencari judul di Wikipedia')
        .addStringOption(option => 
            option.setName('judul')
                .setDescription('Judul yang kamu cari')
                .setRequired(true)),
    async execute(interaction) {
        const judul = interaction.options.getString('judul');

        try {
            const searchingEmbed = new EmbedBuilder()
                .setTitle('Sedang mencari...')
                .setDescription(`Mencari informasi untuk judul: **${judul}**`)
                .setColor(0x1D4ED8);

            await interaction.deferReply({ embeds: [searchingEmbed], ephemeral: true });

            const response = await axios.get(`https://id.wikipedia.org/w/api.php`, {
                params: {
                    action: 'query',
                    format: 'json',
                    prop: 'extracts|pageimages|info',
                    inprop: 'url',
                    piprop: 'thumbnail',
                    pithumbsize: 200,
                    exintro: true,
                    explaintext: true,
                    titles: judul
                }
            });

            const pages = response.data.query.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];

            if (pageId === "-1") {
                await interaction.editReply({ content: 'Judul tidak ditemukan di Wikipedia.', ephemeral: true });
                return;
            }

            const extract = page.extract;
            const pageUrl = page.fullurl;
            const thumbnail = page.thumbnail ? page.thumbnail.source : null;

            const resultEmbed = new EmbedBuilder()
                .setTitle(page.title)
                .setURL(pageUrl)
                .setDescription(extract)
                .setColor(0x1D4ED8);

            if (thumbnail) {
                resultEmbed.setThumbnail(thumbnail);
            }

            resultEmbed.addFields(
                { name: 'Link Artikel', value: `[Klik disini](${pageUrl})`, inline: true },
                { name: 'Judul', value: page.title, inline: true },
                { name: 'ID Halaman', value: page.pageid.toString(), inline: true }
            );

            await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mencari di Wikipedia.', ephemeral: true });
        }
    }
};
