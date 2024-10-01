const chalk = require("chalk");
const { EmbedBuilder } = require("discord.js");
const { Manager } = require("erela.js");
const config = require("../../config");
const Spotify = require("erela.js-spotify");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // ===[ START ]====================[ MUSIC SYSTEM ]====================[ START ]=== //
        function msToTime(duration) {

            var milliseconds = parseInt((duration % 1000) / 100),
                seconds = parseInt((duration / 1000) % 60),
                minutes = parseInt((duration / (1000 * 60)) % 60),
                hours = parseInt((duration / (1000 * 60 * 60)) % 24);
        
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
        
            if (duration < 3600000) {
                return minutes + ":" + seconds;
            } else {
                return hours + ":" + minutes + ":" + seconds;
            }
        }
        
        client.manager = new Manager({
            defaultSearchPlatform: 'youtube music',
            nodes: [
                {
                    identifier: 'Private Lavalink Server',
                    host: config.api.lavalink.host,
                    port: config.api.lavalink.port,
                    password: config.api.lavalink.password,
                    secure: config.api.lavalink.secure,
                    retryDelay: 5000
                }
            ],
            plugins: [new Spotify({
                clientID: config.api.spotify.id,
                clientSecret: config.api.spotify.secret
            })],
            autoPlay: true,
            send: (id, payload) => {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        })

            .on("nodeConnect", node => {
                console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('['), chalk.grey('LAVALINK'), chalk.red(']'), chalk.cyan(`Successfully connect to ${node.options.identifier}`));
            })

            .on('nodeDisconnect', node => {
                console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('['), chalk.grey('LAVALINK'), chalk.red(']'), chalk.cyan(`Disconnected from ${node.options.identifier}`));
            })

            .on('nodeReconnect', node => {
                console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('['), chalk.grey('LAVALINK'), chalk.red(']'), chalk.cyan(`Reconnected to ${node.options.identifier}`));
            })

            .on("trackStart", async (player, track) => {
                const requester = await client.users.fetch(track.requester.id);
                await client.channels.cache.get(player.textChannel).send({
                    embeds: [new EmbedBuilder()
                        .setTitle(`${(track.title).toUpperCase()}`)
                        .setColor(config.embed.color)
                        .setDescription(`Currently playing music on <#${player.voiceChannel}>`)
                        .addFields([
                            { name: 'AUTHOR', value: `\`\`\`${track.author}\`\`\``, inline: true },
                            { name: 'REQUESTER', value: `\`\`\`${requester.displayName}\`\`\``, inline: true },
                            { name: 'DURATION', value: `\`\`\`${track.isStream ? 'Streaming' : msToTime(track.duration)}\`\`\``, inline: true },
                            { name: 'VOLUME', value: `\`\`\`${player.volume}%\`\`\``, inline: true },
                            { name: 'REPEAT MODE', value: `\`\`\`${player.queueRepeat}\`\`\``, inline: true },
                            { name: 'QUEUE LEFT', value: `\`\`\`${player.queue.length}\`\`\``, inline: true },
                        ])
                        .setImage(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)]
                });
            })

            .on("trackStuck", async (player, track) => {
                await client.channels.cache.get(player.textChannel).send({
                    embeds: [new EmbedBuilder()
                        .setColor(config.embed.color)
                        .setDescription(`Stuck when playing  : [${track.title}](${track.uri})`)]
                });
            })

            .on("queueEnd", async (player) => {
                await client.channels.cache.get(player.textChannel).send({
                    embeds: [new EmbedBuilder()
                        .setDescription(`The music queue has finished playing and left the voice channel!`)
                        .setColor(config.embed.color)]
                }).then(async (msg) => {
                    await player.destroy();
                    setTimeout(function () {
                        msg.delete();
                    }, 5000);
                });
            })

        client.on("raw", d => client.manager.updateVoiceState(d));
        client.manager.init(client.user.id);

    }
}