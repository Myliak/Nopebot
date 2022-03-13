const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	getData() {
		return new SlashCommandBuilder()
		.setName('skoc')
		.setDescription(':)')
        .setDefaultPermission(true)
		.addUserOption(option => option.setName("user").setDescription("Kdo ti má skočit na péro").setRequired(true));
	},
	permitted(member){
		return true;
	},
	async execute(interaction) {
        const member = interaction.options.getUser('user');
        await interaction.reply({allowedMentions: { users: [member.id] }, content: "Skoč mi na péro <@" + member.id + ">"});
	},
};