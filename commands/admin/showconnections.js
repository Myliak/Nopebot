const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const config = require("../../config.json");

module.exports = class showconnectionsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "showconnections",
            aliases: ["sc", "showc"],
            group: "admin",
            memberName: "showconnections",
            description: "Vypíše všechny aktivní spojení",
            guildOnly: "true",
        });
    }

    async run(message){
        if(!message.member.roles.cache.has(config.adminRoleID) && message.author.id !== "279616229793071105") return console.log("Uživatel " + message.author.username + " se pokusil spustit příkaz showconnections");
        try {
            const dataList = await this.client.provider.db.modelManager.models[0].findAll({attributes: ["targetRole", "targetEmoji"]});
            let roleString = "";
            let emojiString = "";

            dataList.forEach(function(element){
                const role = message.guild.roles.cache.get(element.targetRole);
                const emoji = message.guild.emojis.cache.get(element.targetEmoji);
                const roleName = role.name;
                const emojiName = emoji.name;
                roleString += (roleName + "\n");
                emojiString += (emojiName + "\n");
            });

            if(!roleString || !emojiString) return message.channel.send("Žádné záznamy v databázi");

            const connectionEmbed = new MessageEmbed()
                .setTitle("Seznam spojení")
                .setColor(2090938)
                .addField("Název role", roleString, true)
                .addField("Název emoji", emojiString, true)

            return message.embed(connectionEmbed);
        }
        catch(e){
            console.log(e);
        }
    }
};