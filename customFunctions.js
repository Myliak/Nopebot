const config = require("./config.json");
const { MessageEmbed, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const { Routes } = require('discord-api-types/v9');
const { GuildSettings, RoleConnection } = require("./dbObjects.js");
const punycode = require('punycode/');

const collectors = new Collection();

exports.startCollectors = async function(client){
    const uniqueMessages = await RoleConnection.aggregate("message_id", "DISTINCT", { plain: false });
    for(let i = 0; i < uniqueMessages.length; i++){
        const dbConnections = await RoleConnection.findAll({ where: { message_id: uniqueMessages[i].DISTINCT }});
        const targetGuild = client.guilds.cache.get(dbConnections[0].guild_id);
        for(let channel of targetGuild.channels.cache.values()){
            if(channel.type === "GUILD_TEXT"){
                try{
                    const reactionMessage = await channel.messages.fetch(uniqueMessages[i].DISTINCT);
                    if (reactionMessage != null){
                        exports.startCollector(targetGuild, reactionMessage, dbConnections);
                        return;
                    }
                }
                catch (e){
                    console.log(e);
                }
            }
        }
    }
}

exports.startCollector = async function(guild, message, emoteList){
    let tempArray = [];
    for (let i = 0; i < emoteList.length; i++) {
        if(emoteList[i].emote_id_unicode){
            tempArray[i] = "reaction.emoji.name === '" + punycode.decode(emoteList[i].emote_id) + "'";
        }
        else{
            tempArray[i] = "reaction.emoji.id === '" + emoteList[i].emote_id + "'";
        }
    }
    //Check for active collector
    let activeCollector = collectors.get(message.id);
    if (activeCollector !== undefined){
        activeCollector.stop();
    }

    const filterString = "return (" + tempArray.join(' || ') + ")";
    const filter = new Function("reaction, user", filterString);
    const collector = message.createReactionCollector({ filter, dispose: true});
    
    //Set active collector
    collectors.set(message.id, collector);
    console.log("Collector created with filter: " + filterString);
    collector.on('collect', async (reaction, user) => {
        if(user.id.toString() === config.clientId){
            return;
        }

        let connection;
        if(reaction.emoji.id === null){
            connection = await RoleConnection.findOne({ where: { emote_id: punycode.encode(reaction.emoji.name) }});
        }
        else{
            connection = await RoleConnection.findOne({ where: { emote_id: reaction.emoji.id }})
        }

        if(connection !== null){
            exports.addRole(guild, user.id, connection.role_id).then(() => console.log("Added role " + reaction._emoji.name + " to " + user.username));
        }
    });
    collector.on('remove', async (reaction, user) => {
        if(user.id.toString() === config.clientId){
            return;
        }

        let connection;
        if(reaction.emoji.id === null){
            connection = await RoleConnection.findOne({ where: { emote_id: punycode.encode(reaction.emoji.name) }});
        }
        else{
            connection = await RoleConnection.findOne({ where: { emote_id: reaction.emoji.id }})
        }

        if(connection !== null) {
            exports.removeRole(guild, user.id, connection.role_id).then(() => console.log("Removed role " + reaction._emoji.name + " from " + user.username));
        }
    });
}

exports.addRole = async function(guild, userID, roleID){
    let targetRole = await guild.roles.cache.get(roleID);
    const targetMember = await guild.members.fetch(userID);
    targetMember.roles.add(targetRole).catch(console.error);
};

exports.removeRole = async function(guild, userID, roleID){
    let targetRole = await guild.roles.cache.get(roleID);
    const targetMember = await guild.members.fetch(userID);
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