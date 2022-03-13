const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { RoleConnection } = require("../../dbObjects");
const lib = require("../../customFunctions");
const punycode = require('punycode/');

module.exports = {
	getData() {
        return new SlashCommandBuilder()
		.setName('addconnection')
		.setDescription('Creates new connection between a message and an emoji')
        .setDefaultPermission(true)
		.addStringOption(option => option.setName("message").setDescription("Id of message to connect reactions to").setRequired(true))
		.addRoleOption(option => option.setName("role").setDescription("Tag connected role").setRequired(true))
		.addStringOption(option => option.setName("emote").setDescription("Emote or id of emote for reaction").setRequired(true));
    },
	permitted(member){
		return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
	},
	async execute(interaction) {
		const emote = interaction.options.getString("emote");
		const message = interaction.options.getString("message");
		const role = interaction.options.getRole("role");

		await interaction.deferReply()

		//Emote id pro uložení
		var emoteId;
		var isUnicode
		//Custom emote
		if(emote.startsWith("<:")){
			emoteId = emote.toString().split("\:")[2].slice(0,-1)
			isUnicode = false;
		}
		//Direct custom emote id
		else if(emote.length > 8){
			emoteId = emote;
			isUnicode = false;
		}
		//Retarded unicode
		else{
			emoteId = punycode.encode(emote);
			isUnicode = true;
		}

		var notFound = true;
		//Hledání zprávy pro reakci
		for(let channel of interaction.guild.channels.cache.values()){
            if(channel.type === "GUILD_TEXT") {
                try {
                    const reactionMessage = await channel.messages.fetch(message);
                    if(reactionMessage != null){
						console.log("Creating new RoleConnection entry");
						await RoleConnection.create({
							guild_id: interaction.guildId,
							role_id: role.id,
							message_id: reactionMessage.id,
							emote_id: emoteId,
							emote_id_unicode: isUnicode
						});

                        notFound = false;
                        await reactionMessage.react(emote);

						//Restart collectors on a message
						const dbConnections = await RoleConnection.findAll({ where: { message_id: reactionMessage.id }});
						await lib.startCollector(interaction.guild, reactionMessage, dbConnections);

						console.log("New connection between " + role.name + " and " + emote + " created");
                        return await interaction.editReply("New connection between " + role.name + " and " + emote + " created");
                    }
                    
                }
                catch (e) {
                    if (e.name === "SequelizeUniqueConstraintError") {
						console.log(e);
                        return await interaction.editReply("You are trying to create an connection on emote which is already in use");
                    }
					else if(e.message === "Unknown Message"){
						notFound = true;
					}
                    else {
						console.log(e);
                        return await interaction.editReply("Unknown error");
                    }
                }
            }
        }
		
		if(notFound){
            await interaction.editReply("Message not found");
        }
	},
};