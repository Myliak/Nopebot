const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require("../customFunctions.js");
const { GuildSettings } = require("../dbObjects");
const { Permissions } = require('discord.js');

module.exports = {
	getData() {
		return new SlashCommandBuilder()
		.setName('enable')
		.setDescription('Enables command set for a server')
        .setDefaultPermission(true)
		.addStringOption(option => {
			option.setName('module')
				.setDescription("Name of module to enable")
				.setRequired(true);

			var columnArray = Object.keys(GuildSettings.rawAttributes);
			//skip id, guild_id
			for(let i = 2; i < columnArray.length; i++){
				option.addChoice(columnArray[i], columnArray[i]);
			}

			return option;
		});
	},
	permitted(member){
		return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
	},
	async execute(interaction) {
		const moduleName = interaction.options.getString('module');
		
		await interaction.deferReply();
		await lib.refreshModules(moduleName, true, interaction.applicationId, interaction.guildId);
		await interaction.editReply('Command set of ' + moduleName + ' enabled');
	},
};