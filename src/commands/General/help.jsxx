const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Untuk melihat bantuan'),
    async execute(interaction) {
        const commandsPath = path.join(__dirname, '../../commands');

        function readCommands(dir) {
            let results = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                file = path.join(dir, file);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(readCommands(file));
                } else if (file.endsWith('.js')) {
                    results.push(file);
                }
            });
            return results;
        }

        const commandFiles = readCommands(commandsPath);

        const fields = [];

        commandFiles.forEach(file => {
            const command = require(file);
            const userPermissions = command.permissions || [];
            const hasPermission = userPermissions.every(permission => 
                interaction.member.permissions.has(PermissionsBitField.Flags[permission])
            );

            if (hasPermission || userPermissions.length === 0) {
                fields.push({ 
                    name: `**/${command.data.name}**`, 
                    value: `${command.data.description || 'Tidak ada deskripsi'}`, 
                    inline: false 
                });
            }
        });

        const itemsPerPage = 10;
        const totalPages = Math.ceil(fields.length / itemsPerPage);
        let currentPage = 0;

        const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageFields = fields.slice(start, end);

            const embed = new EmbedBuilder()
                .setColor(config.embed.color)
                .setTitle('Bantuan Bot')
                .setDescription('Berikut adalah daftar perintah yang tersedia:')
                .addFields(pageFields)
                .setTimestamp()
                .setFooter({ text: `Halaman ${page + 1} dari ${totalPages}`})
                .setThumbnail('https://static.zerochan.net/Amatsuka.Uto.full.3276218.jpg') 
                .setImage('https://w0.peakpx.com/wallpaper/637/541/HD-wallpaper-anime-virtual-youtuber-amatsuka-uto-nabi-aoi.jpg'); 

            return embed;
        };

        const generateActionRow = (page) => {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('⬅️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1),
                );
            return row;
        };

        const filter = (i) => i.user.id === interaction.user.id;

        const message = await interaction.reply({ 
            embeds: [generateEmbed(currentPage)], 
            components: [generateActionRow(currentPage)], 
            ephemeral: true,
            fetchReply: true 
        });

        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'next') {
                currentPage++;
            } else if (i.customId === 'previous') {
                currentPage--;
            }

            await i.update({ 
                embeds: [generateEmbed(currentPage)], 
                components: [generateActionRow(currentPage)] 
            });
        });

        collector.on('end', async () => {
            await message.edit({ components: [] });
        });
    },
};
