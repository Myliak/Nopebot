const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
const { SlashCommandSubcommandGroupBuilder } = require("@discordjs/builders");
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const { Routes } = require('discord-api-types/v9');

exports.startCollectors = async function(client){
    const roleConnections = client.provider.db.modelManager.models[0];
    const uniqueMessages = await roleConnections.aggregate("targetMessage", "DISTINCT", { plain: false });
    for(let i = 0; i < uniqueMessages.length; i++){
        const dbConnections = await roleConnections.findAll({ where: { targetMessage: uniqueMessages[i].DISTINCT }});
        const targetGuild = client.guilds.cache.get(dbConnections[0].targetGuild);
        for(let channel of targetGuild.channels.cache.values()){
            if(channel.type === "text"){
                try{
                    const reactionMessage = await channel.messages.fetch(uniqueMessages[i].DISTINCT);
                    if(reactionMessage != null){
                        this.startCollector(client, reactionMessage, dbConnections);
                    }
                }
                catch (e){

                }
            }
        }
    }
    
    //const targetChannel = client.channels.cache.get(config.staticTextChannelID);
    // const targetGuild = client.guilds.get(client.provider.db.modelManager.models[2])
    // const targetMessage = await targetChannel.messages.fetch(config.staticMessageID);
    // const emojiList = await roleConnections.findAll({ attributes: ["targetEmoji"]});
}

exports.startCollector = async function(client, targetMessage, emojiList){
    const roleConnections = client.provider.db.modelManager.models[0];
    let tempArray = [];
    for (let i = 0; i < emojiList.length; i++) {
        tempArray[i] = "reaction.emoji.id === '" + emojiList[i].targetEmoji + "'";
    }
    const filterString = "return (" + tempArray.join(' || ') + ") && user.id !== '685118157614088222'";
    const filter = new Function("reaction, user", filterString);
    const collector = targetMessage.createReactionCollector(filter, {dispose: true});
    collector.on('collect', async (reaction, user) => {
        const dbEntity = await roleConnections.findOne({where: {targetEmoji: reaction._emoji.id}});
        this.addRole(client, user.id, dbEntity.dataValues.targetRole, emojiList[0].targetGuild).then(() => console.log("Added role " + reaction._emoji.name + " to " + user.username));
    });
    collector.on('remove', async (reaction, user) => {
        const dbEntity = await roleConnections.findOne({where: {targetEmoji: reaction._emoji.id}});
        this.removeRole(client, user.id, dbEntity.dataValues.targetRole, emojiList[0].targetGuild).then(() => console.log("Removed role " + reaction._emoji.name + " from " + user.username));
    });
}

exports.addRole = async function(client, userID, roleID, guildID){
    const targetGuild = await client.guilds.cache.get(guildID);
    let targetRole = await targetGuild.roles.cache.get(roleID);
    const targetMember = await targetGuild.members.fetch(userID);
    targetMember.roles.add(targetRole).catch(console.error);
};

exports.removeRole = async function(client, userID, roleID, guildID){
    const targetGuild = await client.guilds.cache.get(guildID);
    let targetRole = await targetGuild.roles.cache.get(roleID);
    const targetMember = await targetGuild.members.fetch(userID);
    if(targetMember.roles.cache.find(function (element) {return element === targetRole;}) !== null){
        targetMember.roles.remove(targetRole).catch(console.error);
    }
};

exports.getDatabaseStrings = function(sequelize){
    // console.log(sequelize.models.GuildSettings.rawAttributes);
    var columnArray = Object.keys(sequelize.models.GuildSettings.rawAttributes);
    for(let i = 1; i < columnArray.length - 3; i++){
        console.log(columnArray[i]);
    }
    // for(let key in sequelize.models.GuildSettings.rawAttributes){
    //     console.log(key);
    // }
    // console.log(sequelize.models.GuildSettings.rawAttributes);
    // console.log(sequelize.models.GuildSettings);
}

exports.refreshModules = async function(moduleNames, clientId, guildId){
    const commands = [];
    
    for(var moduleName in modulesNames){
        const commandFiles = fs.readdirSync(`./commands/${moduleName}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands/${moduleName}/${file}`);
            commands.push(command.getData().toJSON());
        }
    }
    const rest = new REST({ version: '9' }).setToken(config.token);

    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        }
    })();
}

exports.register