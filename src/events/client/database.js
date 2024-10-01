const { default: mongoose } = require("mongoose");
const config = require("../../config");
const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        mongoose.set('strictQuery', true);
        mongoose.connect(config.client.database, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log(chalk.white(chalk.bold('SYSTEM')), chalk.red('+'), chalk.cyan(`Successfully logged to Mongo Database`))
        })
    }
}