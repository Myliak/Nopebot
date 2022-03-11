const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { RoleConnection } = require("../../dbObjects");
const lib = require("../../customFunctions");

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
		if(emote.Length > 1){
			emoteId = targetEmoji.toString().split("\:")[2].slice(0,-1)
			isUnicode = false;
		}
		else{
			emoteId = emote.codePointAt(0).toString();
			isUnicode = true;
		}

        try{
            await RoleConnection.destroy({ where: { guild_id: interaction.guildId, emote_id: emoteId, emote_id_unicode: isUnicode, message_id: message }});
        }
        catch(e){
            console.log(e);
            await interaction.editReply("Unknown error");
        }
        
        console.log("Role connection on message " + message + " of reaction " + emote + " removed");
        // lib.startCollector(this.client);
        await interaction.editReply("Role connection removed");
	}
};