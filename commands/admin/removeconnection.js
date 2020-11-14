const lib = require("../../customFunctions.js");
const config = require("../../config.json");
const { Command } = require('discord.js-commando');

module.exports = class removeconnectionCommand extends Command {
    constructor(client) {
        super(client, {
            name: "removeconnection",
            aliases: ["rc", "removec"],
            group: "admin",
            memberName: "removeconnection",
            description: "Přeruší spojení mezi reakcí a emoji",
            guildOnly: "true",
            args:[
                {
                    key: "targetRole",
                    prompt: "Tagněte roli pro smazání spojení",
                    type: "string"
                },
            ]
        });
    }

    async run(message, {targetRole}){
        if(!message.member.roles.cache.has(config.adminRoleID) && message.author.id !== "279616229793071105") return console.log("Uživatel " + message.author.username + " se pokusil spustit příkaz removeconnections");

        const role = message.guild.roles.cache.get(targetRole.slice(3, -1));
        //const connectedToRole = await this.client.provider.db.modelManager.models[0].findOne({ where: {targetRole: role.id}});

        //const emojiID = connectedToRole.dataValues.targetEmoji;
        //const messageID = connectedToRole.dataValues.targetMessage;

        /*role.members.forEach(function (element){
            element.roles.remove(role.id);
        });*/

        await this.client.provider.db.modelManager.models[0].destroy({ where: { targetRole: role.id } });

        //const targetMessageObj = await textChannelObj.messages.fetch(messageID);
        //const targetReactions = await targetMessageObj.reactions.cache.get(emojiID);
        //targetReactions.remove();

        lib.startCollector(this.client);
        return message.channel.send("Připojení smazáno");
    }
};