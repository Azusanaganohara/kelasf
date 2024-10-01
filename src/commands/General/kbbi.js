const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kbbi')
        .setDescription('Untuk mencari makna dari kata itu')
        .addStringOption(option => 
            option.setName('kata')
                .setDescription('Masukkan kata untuk mencari di kbbi')
                .setRequired(true)),

    async execute(interaction) {
        const kata = interaction.options.getString('kata');
        const maxRetries = 3;
        const retryDelay = 2000;

        async function fetchKBBI(kata, retries = maxRetries) {
            try {
                const response = await axios.get(`https://kbbi-api-zhirrr.vercel.app/api/kbbi?text=${kata}`, {
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-US) AppleWebKit/534.10 (KHTML, like Gecko) Chrome/8.0.552.224 Safari/534.10'
                    },
                    timeout: 5000 
                });
                return response.data;
            } catch (error) {
                if (retries > 0 && error.response && error.response.status === 504) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return fetchKBBI(kata, retries - 1);
                } else {
                    throw error;
                }
            }
        }

        try {
            await interaction.deferReply();

            const result = await fetchKBBI(kata);

            if (result && result.arti && result.arti.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle(`Makna kata: ${result.lema.trim()}`)
                    .setColor(config.embed.color)
                    .setDescription(result.arti.map((def, index) => `${index + 1}. ${def}`).join('\n'))
                    .setTimestamp()
                    .setThumbnail('https://aplikasi-indonesia.com/template/assets/img/kamus-besar-bahasa-indonesia-kbbi.png')
                    .setFooter({ text: 'Sumber: KBBI', iconURL: 'https://aplikasi-indonesia.com/template/assets/img/kamus-besar-bahasa-indonesia-kbbi.png' });

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply(`Tidak ditemukan makna untuk kata "${kata}" di KBBI.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('Terjadi kesalahan saat mencari kata di KBBI. Silakan coba lagi nanti.');
        }
    },
};
