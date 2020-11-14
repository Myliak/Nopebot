const config = require("./config.json");
const { MessageEmbed } = require('discord.js');

exports.startCollector = async function(client){
    const roleConnections = client.provider.db.modelManager.models[0];
    const targetChannel = client.channels.cache.get(config.staticTextChannelID);
    const targetMessage = await targetChannel.messages.fetch(config.staticMessageID);
    const emojiList = await roleConnections.findAll({ attributes: ["targetEmoji"]});
    let tempArray = [];
    for (let i = 0; i < emojiList.length; i++) {
        tempArray[i] = "reaction.emoji.id === '" + emojiList[i].targetEmoji + "'";
    }
    const filterString = "return (" + tempArray.join(' || ') + ") && user.id !== '685118157614088222'";
    const filter = new Function("reaction, user", filterString);
    const collector = targetMessage.createReactionCollector(filter, {dispose: true});
    collector.on('collect', async (reaction, user) => {
        const dbEntity = await roleConnections.findOne({where: {targetEmoji: reaction._emoji.id}});
        this.addRole(client, user.id, dbEntity.dataValues.targetRole).then(() => console.log("Added role " + reaction._emoji.name + " to " + user.username));
    });
    collector.on('remove', async (reaction, user) => {
        const dbEntity = await roleConnections.findOne({where: {targetEmoji: reaction._emoji.id}});
        this.removeRole(client, user.id, dbEntity.dataValues.targetRole).then(() => console.log("Removed role " + reaction._emoji.name + " from " + user.username));
    });
}

// exports.createCollectors = async function(client){
//     //Zastaví všechny collectory
//     if(!collectors.empty){
//         collectors.forEach(function(element){
//             element.stop();
//         });
//         collectors = [];
//     }

//     try{
//         // const roleConnections = client.provider.db.modelManager.models[0];
//         // const messageIdList = await roleConnections.aggregate("targetMessage", "DISTINCT", {plain: false});

//         // for(let i = 0; i < messageIdList.length; i++){
//         //     const messageID = messageIdList[i].DISTINCT;
//         //     for(let element of client.channels.cache.values()){
//         //         if(element.type === "text") {
//         //             try{
//         //                 const targetMessage = await element.messages.fetch(messageID);
//         //                 const emojiList = await roleConnections.findAll({where: {targetMessage: messageIdList[i].DISTINCT}});
//         //                 let tempArray = [];
//         //                 for (let i = 0; i < emojiList.length; i++) {
//         //                     tempArray[i] = "reaction.emoji.id === '" + emojiList[i].targetEmoji + "'";
//         //                 }
//         //                 const filterString = "return (" + tempArray.join(' || ') + ") && user.id !== '685118157614088222'";
//         //                 const filter = new Function("reaction, user", filterString);
//         //                 collectors[i] = targetMessage.createReactionCollector(filter, {dispose: true});
//         //                 collectors[i].on('collect', async (reaction, user) => {
//         //                     const dbEntity = await roleConnections.findOne({where: {targetEmoji: reaction._emoji.id}});
//         //                     this.addRole(client, user.id, dbEntity.dataValues.targetRole).then(() => console.log("Added role " + reaction._emoji.name + " to " + user.username));
//         //                 });
//         //                 collectors[i].on('remove', async (reaction, user) => {
//         //                     const dbEntity = await roleConnections.findOne({where: {targetEmoji: reaction._emoji.id}});
//         //                     this.removeRole(client, user.id, dbEntity.dataValues.targetRole).then(() => console.log("Removed role " + reaction._emoji.name + " from " + user.username));
//         //                 });
//         //             }
//         //             catch(e){}
//         //         }
//         //     }
//         // }
//     }
//     catch(e){
//         console.log("CreateCollector error: " + e);
//     }
// };

exports.addRole = async function(client, userID, roleID){
    const targetGuild = await client.guilds.cache.get(config.staticGuildID);
    let targetRole = await targetGuild.roles.cache.get(roleID);
    const targetMember = await targetGuild.members.fetch(userID);
    targetMember.roles.add(targetRole).catch(console.error);
};

exports.removeRole = async function(client, userID, roleID){
    const targetGuild = await client.guilds.cache.get(config.staticGuildID);
    let targetRole = await targetGuild.roles.cache.get(roleID);
    const targetMember = await targetGuild.members.fetch(userID);
    if(targetMember.roles.cache.find(function (element) {return element === targetRole;}) !== null){
        targetMember.roles.remove(targetRole).catch(console.error);
    }
};