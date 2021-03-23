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
            userPermissions: ["ADMINISTRATOR"],
            args:[
                {
                    key: "targetRole",
                    prompt: "Tagněte roli pro smazání spojení",
                    type: "string"
                },
            ]
        });
    }

    hasPermission(message){
        return message.member.hasPermission('ADMINISTRATOR');
    }

    async run(message, {targetRole}){
        const role = message.guild.roles.cache.get(targetRole.slice(3, -1));
        await this.client.provider.db.modelManager.models[0].destroy({ where: { targetRole: role.id } });
        lib.startCollector(this.client);
        return message.channel.send("Připojení smazáno");
    }
};