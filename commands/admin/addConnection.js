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
            userPermissions: ["ADMINISTRATOR"],
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
                },
                {
                    key: "targetMessage",
                    prompt: "Zadejte ID zprávy, na které chcete role",
                    type: "string"
                }
            ]
        });
    }

    hasPermission(message){
        return message.member.hasPermission('ADMINISTRATOR');
    }

    async run(message, { targetRole, targetEmoji, targetMessage }){
        console.log(targetRole);
        console.log(targetEmoji);
        const role = message.guild.roles.cache.get(targetRole.slice(3, -1));
        let emoji = targetEmoji;
        if(targetEmoji.length > 1){
            emoji = message.guild.emojis.cache.get(targetEmoji.toString().split("\:")[2].slice(0,-1));
        }
        console.log(role);
        console.log(emoji);
        let notFound = true;
        
        for(let channel of message.guild.channels.cache.values()){
            if(channel.type === "text") {
                try {
                    const reactionMessage = await channel.messages.fetch(targetMessage);
                    if(reactionMessage != null){
                        await this.client.provider.db.modelManager.models[0].create({
                            targetMessage: reactionMessage.id,
                            targetEmoji: emoji.id,
                            targetRole: role.id,
                            targetGuild: message.guild.id
                        });

                        notFound = false;
                        lib.startCollectors(this.client);
                        await reactionMessage.react(emoji);
                        return message.channel.send("Nové spojení mezi " + role.name + " a " + emoji.name + " vytvořeno");
                    }
                    
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