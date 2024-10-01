const chalk = require("chalk");
const { ActivityType, PresenceUpdateStatus } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.cyan(`Successfully logged to ${client.user.username}`));

        const owner = await client.users.fetch('729913441858486315');

        setInterval(async function () {
            const activities = [
                { name: `${client.users.cache.size} users in ${client.guilds.cache.size} servers`, type: ActivityType.Watching },
                { name: `Ping: ${client.ws.ping}ms`, type: ActivityType.Watching },
                { name: `Bot Owner: ${owner.tag}`, type: ActivityType.Watching },
                { name: `Happy to help!`, type: ActivityType.Playing },
                { name: `Use /help for commands`, type: ActivityType.Listening },
                { name: `Learning new commands`, type: ActivityType.Playing },
                { name: `Securing servers`, type: ActivityType.Competing },
                { name: `Monitoring ${client.guilds.cache.size} servers`, type: ActivityType.Watching },
                { name: `Protecting ${client.users.cache.size} users`, type: ActivityType.Watching },
                { name: `Enjoying the code`, type: ActivityType.Playing },
                { name: `Listening to your commands`, type: ActivityType.Listening },
                { name: `In the cloud`, type: ActivityType.Watching }
            ];

            const statuses = [
                PresenceUpdateStatus.Online,
                PresenceUpdateStatus.Idle,
                PresenceUpdateStatus.DoNotDisturb
            ];

            const activity = activities[Math.floor(Math.random() * activities.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            client.user.setActivity(activity.name, { type: activity.type });
            client.user.setPresence({ status: status });
        }, 10000);
    }
}
