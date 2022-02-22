const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disable')
		.setDescription('Disables command set for a server')
        .setDefaultPermission(true),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};