const config = require("./config.json");
const { MessageEmbed, Collection } = require('discord.js');
const { SlashCommandSubcommandGroupBuilder } = require("@discordjs/builders");
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const { Routes } = require('discord-api-types/v9');
const { GuildSettings, Guild } = require("./dbObjects.js");

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

exports.refreshModules = async function(moduleName, enable, clientId, guildId){
    //Module update in db
    var updateClause = {};
    updateClause[moduleName] = enable;
    await GuildSettings.update(updateClause, { where: { guild_id: guildId }});

    //Read command files
    const commands = await exports.getActiveCommands(guildId, true); //REFRESH MODULU JE LOCAL, FALSE PO GLOBALU
    const rest = new REST({ version: '9' }).setToken(config.token);

    //Command push on discord api
    try {
        let array = Array.from(commands.values());
        array = array.map(x => x.getData());
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: array });
    } catch (error) {
        console.error(error);
    }
};

exports.getActiveCommands = async function(guildId, withGlobal){
    var guildSetting = await GuildSettings.findOne({where: { guild_id: guildId }});

    //Get active modules on guild
    const activeModules = [];
    var columnNamesArray = Object.keys(guildSetting.dataValues)
    var columnValuesArray = Object.values(guildSetting.dataValues)
    //skip id, guild_id
    for(let i = 2; i < columnNamesArray.length; i++){
        if(columnValuesArray[i] == true){
            activeModules.push(columnNamesArray[i]);
        }
    }

    //Read command files
    var commands = new Collection();
    for(var activeModule of activeModules){
        commands = new Collection([...commands, ...exports.getCommands(activeModule)]);
    }

    if(withGlobal){
        commands = new Collection([...commands, ...exports.getCommands("global")]);
    }

    return commands;
};

exports.getCommands = function(moduleName){
    var path = `./commands/${moduleName}`;
    if (moduleName == "global"){
        path = "./commands";
    }

    const commands = new Collection();
    const commandFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path + '/' + file);
        commands.set(command.getData().name, command);
    }

    return commands;
}

exports.register