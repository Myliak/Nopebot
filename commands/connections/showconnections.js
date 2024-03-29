const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { RoleConnection } = require("../../dbObjects");
const punycode = require('punycode/');

module.exports = {
	getData() {
        return new SlashCommandBuilder()
		.setName('showconnections')
		.setDescription('Shows active connections in your guild')
        .setDefaultPermission(true)
    },
	permitted(member){
		return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || member.id == 279616229793071105;
	},
	async execute(interaction) {
        try {
            await interaction.deferReply();
            const dataList = await RoleConnection.findAll({ where: { guild_id: interaction.guildId }});
            let roleString = "";
            let emoteString = "";

            dataList.forEach(function(element){
                const role = interaction.guild.roles.cache.get(element.role_id);
                roleString += (role.name + "\n");

                if(element.emote_id_unicode){
                    emoteString += punycode.decode(element.emote_id) + "\n";
                }
                else{
                    const emote = interaction.guild.emojis.cache.get(element.emote_id);
                    if(emote !== undefined){
                        emoteString += (emote.name + "\n");
                    }
                    else {
                        emoteString += element.emote_id + "\n";
                    }
                }
            });

            if(!roleString || !emoteString) return await interaction.editReply("No active connections in your guild");

            const connectionEmbed = new MessageEmbed()
                .setTitle("List of connections")
                .setColor(2090938)
                .addField("Role name", roleString, true)
                .addField("Emote", emoteString, true)

            return await interaction.editReply({ embeds: [connectionEmbed] });
        }
        catch(e){
            console.log(e);
        }
	}
};