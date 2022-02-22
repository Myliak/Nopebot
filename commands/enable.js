const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enable')
		.setDescription('Enables command set for a server')
        .setDefaultPermission(true),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};