const { prefix } = require('../config.json');
const { RichEmbed } = require('discord.js');

module.exports = {
    name: 'help',
    description: "Vypisuje informace o jednotlivých příkazech \n Použitelné pro všechny uživatele \n Help bez argumentu vypíše seznam možných argumentů",
    aliases: ["h"],
    usage: "nope help [název příkazu]",
    guildOnly: true,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push("Seznam všech příkazů na serveru.");
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nNapiš \`${prefix}help [název příkazu]\` abys dostal informace o určitém příkazu.`);
            return message.channel.send(data, { split: true })
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        const embed = new RichEmbed()
            .setColor(0x851919)
            .setTitle("Help pro příkaz: " + command.name)
            .addField("Syntaxe příkazu:", command.usage)
            .addField("Informace:", command.description);

        if(command.description){
            embed.setDescription("Aliasy: " + command.aliases.join(", "));
        }

        message.channel.send(embed);
    },
};