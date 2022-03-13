const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { RoleConnection } = require("../../dbObjects");
const lib = require("../../customFunctions");
const punycode = require('punycode/');

module.exports = {
	getData() {
        return new SlashCommandBuilder()
		.setName('removeconnection')
		.setDescription('Removes connection between a message and an emoji')
        .setDefaultPermission(true)
		.addStringOption(option => option.setName("message").setDescription("Id of message from where to remove reaction").setRequired(true))
		.addStringOption(option => option.setName("emote").setDescription("Emote or id of emote of reaction").setRequired(true));
    },
	permitted(member){
		return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
	},
	async execute(interaction) {
		const emote = interaction.options.getString("emote");
		const message = interaction.options.getString("message");

        await interaction.deferReply();

        //Emote id pro uložení
		var emoteId;
		var isUnicode;
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

		for(let channel of interaction.guild.channels.cache.values()){
            if(channel.type === "GUILD_TEXT") {
                try {
                    const reactionMessage = await channel.messages.fetch(message);
                    if(reactionMessage != null){
						await RoleConnection.destroy({ where: { guild_id: interaction.guildId, emote_id: emoteId, emote_id_unicode: isUnicode, message_id: message }});
						const dbConnections = await RoleConnection.findAll({ where: { message_id: reactionMessage.id }});
						await lib.startCollector(interaction.guild, reactionMessage, dbConnections);

						console.log("Role connection on message " + message + " of reaction " + emote + " removed");
						return await interaction.editReply("Role connection removed");
                    }
                    
                }
                catch (e) {
					if(e.message === "Unknown Message"){
						notFound = true;
					}
                    else {
						console.log(e);
                        return await interaction.editReply("Unknown error");
                    }
                }
            }
        }

        try{
            
        }
        catch(e){
            console.log(e);
            await interaction.editReply("Unknown error");
        }
        
        
	}
};