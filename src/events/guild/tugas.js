const Homework = require("../../database/tugas");
const Conftugas = require("../../database/conftugas"); 
const { EmbedBuilder } = require("discord.js");
const moment = require("moment-timezone");
const config = require("../../config");

module.exports = {
    async onTaskUpdate(client) {
        const now = moment().tz("Asia/Jakarta");
        const upcomingTimeLimit = now.clone().add(24, 'hours');
        const overdueTimeLimit = now.clone(); 

        try {
            const conf = await Conftugas.findOne({ guildId: client.guilds.cache.first().id });

            if (!conf || !conf.channelId) {
                console.error("Channel untuk pengingat tugas tidak ditemukan atau belum dikonfigurasi.");
                return;
            }

            const channel = await client.channels.fetch(conf.channelId).catch(err => {
                console.error(`Gagal menemukan channel dengan ID ${conf.channelId}:`, err);
                return null;
            });

            if (!channel) {
                console.error("Channel tidak ditemukan, pastikan channel ID valid.");
                return; 
            }

            const upcomingTasks = await Homework.find({
                Tanggal: { $lte: upcomingTimeLimit.format("DD-MM-YYYY") },
                Jam: { $lte: upcomingTimeLimit.format("HH:mm") }
            });

            const overdueTasks = await Homework.find({
                Tanggal: { $lt: overdueTimeLimit.format("DD-MM-YYYY") },
                Jam: { $lt: overdueTimeLimit.format("HH:mm") }
            });

            if (upcomingTasks.length > 0) {
                for (const task of upcomingTasks) {
                    const embed = new EmbedBuilder()
                        .setTitle('Tugas Mendekati Tenggat Waktu')
                        .setColor(config.embed.color)
                        .setDescription(`Tugas **${task.Matkul}** mendekati tenggat waktu!\n\n**Deadline**: ${task.Tanggal} ${task.Jam}`)
                        .addFields(
                            { name: 'Link', value: task.Link, inline: true },
                            { name: 'Catatan', value: task.Catatan || "Tidak ada catatan.", inline: false }
                        )
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }
            }

            if (overdueTasks.length > 0) {
                for (const task of overdueTasks) {
                    const embed = new EmbedBuilder()
                        .setTitle('Tugas Melewati Batas Waktu')
                        .setColor(config.embed.color)
                        .setDescription(`Tugas **${task.Matkul}** telah melewati batas waktu dan akan dihapus dari database.`)
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });

                    await Homework.deleteOne({ _id: task._id });
                }
            }

        } catch (error) {
            console.error("Terjadi kesalahan saat mengecek tugas:", error);
        }
    }
};
