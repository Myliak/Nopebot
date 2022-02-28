const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	getData() {
		return new SlashCommandBuilder()
		.setName('disable')
		.setDescription('Disables command set for a server')
        .setDefaultPermission(true);
	}, 
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};