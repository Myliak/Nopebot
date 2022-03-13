const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	getData() {
		return new SlashCommandBuilder()
		.setName('removepermit')
		.setDescription('Remove a role to a user')
        .setDefaultPermission(true)
        .addRoleOption(option => option.setName("role").setDescription("Role to add").setRequired(true))
		.addUserOption(option => option.setName("user").setDescription("User getting the permit").setRequired(true));
	},
	permitted(member){
		return true;
	},
	async execute(interaction) {
        const member = interaction.options.getMember('user');
		const permitRole = interaction.options.getRole('role');
        
        //Najde u autora zprávy jestli má admina pro permitku kterou přiřazuje [permitka_admin]
        if(interaction.member.roles.cache.find(role => role.name.toLowerCase() == (permitRole.name.toLowerCase() + "_admin")) !== undefined){
            //Zkusí, jestli jde uživateli odebrat permitka
            if(member.roles.cache.find(role => role.name.toLowerCase() == permitRole.name.toLowerCase()) !== null){
                try{
                    member.roles.remove(permitRole).catch(console.error);
                    await interaction.reply({ content: "Permit was removed successfully", ephemeral: true });
                }
                catch (error) {
                    await interaction.reply({ content: "User doesn't exist", ephemeral: true });
                    return;
                }
            } 
            else await interaction.reply({ content: "User doesn't have this permit", ephemeral: true });
        } 
        else await interaction.reply({ content: "You don't have permissions to add this permit", ephemeral: true });
	},
};