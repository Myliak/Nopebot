const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	getData() {
		return new SlashCommandBuilder()
		.setName('getreactions')
		.setDescription('Gets ids of reactions on a message')
        .setDefaultPermission(true)
        .addStringOption(option => option.setName("message").setDescription("Id of message where to read reactions").setRequired(true));
	},
	permitted(member){
		return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
	},
	async execute(interaction) {
		await interaction.deferReply();

		const messageId = interaction.options.getString('message');
		let notFound = true;
		for(let channel of interaction.guild.channels.cache.values()){
            if(channel.type === "GUILD_TEXT") {
				try {
                    const reactionMessage = await channel.messages.fetch(messageId);
					let responseMessage = "";
					notFound = false;
					for(let reaction of reactionMessage.reactions.cache.values()){
						responseMessage += "Name: " + reaction.emoji.name + " Id: " + reaction.emoji.id + "\n";
					}
					return await interaction.editReply(responseMessage);
                }
                catch (e) {
					if(e.message === "Unknown Message"){
						notFound = true;
					}
                    else {
						console.log(e);
                        await interaction.editReply("Unknown error");
                    }
                }
			}
		}

		if (notFound){
			await interaction.editReply("Message was not found");
		}

		
	},
};