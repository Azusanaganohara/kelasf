const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const config = require("../../config");
const { default: axios } = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pixiv')
        .setDescription('Untuk mencari gambar dari pixiv')
        .addStringOption(option =>
            option.setName('art')
                .setDescription('Cari gambar art game/anime')
                .setRequired(true)),

    async execute(interaction) {
        const query = interaction.options.getString('art');

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(config.embed.color)
                .setDescription(`Tunggu sebentar, aku sedang mencarikan gambar untukmu.`)
            ]
        });

        try {
            const pixivData = await axios.get(`https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(query)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.pixiv.net/',
                    'Cookie': `PHPSESSID=${config.pixiv.phpsessid}`
                }
            });

            const artworks = pixivData.data.body.illustManga.data;

            if (artworks.length === 0) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Gambar yang kamu cari tidak ditemukan.`)
                    ]
                });
            } else {
                let currentIndex = 0;

                const updateEmbed = async (index) => {
                    const artwork = artworks[index];
                    const secondData = await axios.get(`https://embed.pixiv.net/oembed.php?url=https%3A%2F%2Fwww.pixiv.net%2Fen%2Fartworks%2F${artwork.id}`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Referer': 'https://www.pixiv.net/',
                            'Cookie': `PHPSESSID=${config.pixiv.phpsessid}`
                        }
                    });

                    const embed = new EmbedBuilder()
                        .setColor(config.embed.color)
                        .setTitle(artwork.title)
                        .setURL(`https://www.pixiv.net/en/artworks/${artwork.id}`)
                        .setAuthor({
                            name: artwork.userName,
                            url: `https://www.pixiv.net/en/users/${artwork.userId}`
                        })
                        .setDescription(`Gambar yang kamu cari berhasil ditemukan.`)
                        .setImage(secondData.data.thumbnail_url)
                        .setFooter({
                            text: `By ${artwork.userName} via Pixiv`
                        });

                    const viewButton = new ButtonBuilder()
                        .setLabel('View Artwork')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.pixiv.net/en/artworks/${artwork.id}`);
                    
                    const previousButton = new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(index === 0);

                    const nextButton = new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(index === artworks.length - 1);

                    const row = new ActionRowBuilder().addComponents(previousButton, nextButton, viewButton);

                    await interaction.editReply({
                        embeds: [embed],
                        components: [row]
                    });
                };

                await updateEmbed(currentIndex);

                const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

                collector.on('collect', async i => {
                    if (i.customId === 'next') {
                        currentIndex++;
                    } else if (i.customId === 'previous') {
                        currentIndex--;
                    }
                    await updateEmbed(currentIndex);
                    await i.deferUpdate();
                });

                collector.on('end', collected => {
                    interaction.editReply({ components: [] });
                });
            }
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setDescription(`Terjadi kesalahan saat mencari gambar.`)
                ]
            });
        }
    }
};
