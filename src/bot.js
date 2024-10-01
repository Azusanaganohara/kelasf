const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const config = require("./config");
const chalk = require("chalk");

const client = new Client({
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync("./src/functions");
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.login(config.client.token);


client.on("error", (err) => {
     console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${err}`))
})

process.on("unhandledRejection", (reason, promise) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${reason}`))
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${promise}`))
})

process.on("uncaughtException", (err, origin) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${err}`))
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${origin}`))
})

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${err}`))
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${origin}`))
})

process.on("warning", (warn) => {
    console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.redBright(`${warn}`))
})