const lib = require("../../customFunctions.js");
const { Command } = require('discord.js-commando');
const config = require("../../config.json");

module.exports = class addconnectionCommand extends Command {
    constructor(client) {
        super(client, {
            name: "addconnection",
            aliases: ["ac", "addc"],
            group: "admin",
            memberName: "addconnection",
            description: "Vytvoří nové spojení na zprávě mezi rolí a reakcí",
            guildOnly: "true",
            args:[
                {
                    key: "targetRole",
                    prompt: "Tagněte roli pro spojení",
                    type: "string"
                },
                {
                    key: "targetEmoji",
                    prompt: "Zadejte emoji pro spojení",
                    type: "string"
                }
            ]
        });
    }

    async run(message, { targetRole, targetEmoji }){
        //Kontrola oprávnění uživatele
        if(!message.member.roles.cache.has(config.adminRoleID) && message.author.id !== "279616229793071105") return console.log("Uživatel " + message.author.username + " se pokusil spustit příkaz createconnection");

        const role = message.guild.roles.cache.get(targetRole.slice(3, -1));
        const emoji = message.guild.emojis.cache.get(targetEmoji.toString().split("\:")[2].slice(0,-1));
        let notFound = true;

        for(let element of this.client.channels.cache.values()){
            if(element.type === "text") {
                try {
                    const targetMessage = await element.messages.fetch(config.staticMessageID);
                    await this.client.provider.db.modelManager.models[0].create({
                        targetEmoji: emoji.id,
                        targetRole: role.id,
                    });

                    notFound = false;
                    lib.startCollector(this.client);
                    await targetMessage.react(emoji);
                    return message.channel.send("Nové spojení mezi " + role.name + " a " + emoji.name + " vytvořeno");
                }
                catch (e) {
                    if (e.name === "SequelizeUniqueConstraintError") {
                        console.log(e);
                        return message.channel.send("Používáte roli nebo emoji, které už má spojení");
                    }
                    else if(e.message === "Unknown Message"){
                        notFound = true;
                    }
                    else {
                        console.log(e);
                        return message.channel.send("Neznámá chyba při vytváření spojení");
                    }
                }
            }
        }
        if(notFound){
            message.channel.send("Zpráva nebyla nalezena");
        }
    }
};