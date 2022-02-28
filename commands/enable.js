const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require("../customFunctions.js");
const { DbConnection, GuildSettings } = require("../dbObjects.js");

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
	async execute(interaction) {
		const moduleName = interaction.options.getString('module');
		
		//Database change
		var updateClause = {};
		updateClause[moduleName] = true;
		await GuildSettings.update(updateClause, { where: { guild_id: interaction.guildId }});

		var guildSetting = await GuildSettings.findOne({where: { guild_id: interaction.guildId }});

		//skip id, guild_id
		const activeModules = [];
		var columnNamesArray = Object.keys(guildSetting.dataValues)
		var columnValuesArray = Object.values(guildSetting.dataValues)
		for(let i = 2; i < columnNamesArray.length; i++){
			if(columnValuesArray[i] == true){
				activeModules.push(columnNamesArray[i]);
			}
		}

		console.log(activeModules);
		// await lib.enableModule(moduleName, interaction.applicationId, interaction.guildId);

		await interaction.reply('Command set of ' + moduleName + ' enabled');
	},
};