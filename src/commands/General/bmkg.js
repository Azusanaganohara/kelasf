const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const moment = require("moment-timezone");
const config = require("../../config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cuaca')
        .setDescription('Untuk melihat cuaca di kota')
        .addStringOption(option => 
            option.setName('kota')
                .setDescription('Di kota mana yang anda cari')
                .setRequired(true)),

    async execute(interaction) {
        const kota = interaction.options.getString('kota');
        const apiKey = config.weather.weatherApiKey;
        const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${kota}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            const { location, current } = data;
            const { name, region, country, localtime } = location;
            const { condition, temp_c, humidity, wind_kph } = current;

            const embed = new EmbedBuilder()
                .setColor(config.embed.color)
                .setTitle(`Cuaca di ${name}, ${region}, ${country}`)
                .setDescription(`Waktu lokal: ${localtime}`)
                .addFields(
                    { name: 'Cuaca', value: condition.text, inline: true },
                    { name: 'Temperatur', value: `${temp_c}°C`, inline: true },
                    { name: 'Kelembaban', value: `${humidity}%`, inline: true },
                    { name: 'Angin', value: `${wind_kph} km/h`, inline: true }
                )
                .setThumbnail(`http:${condition.icon}`)
                .setTimestamp()
                .setFooter({ text: 'Data oleh WeatherAPI' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply(`Maaf, tidak dapat mengambil data cuaca untuk kota ${kota}. Pastikan nama kota sudah benar.`);
        }
    }
};
