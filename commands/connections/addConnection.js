const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
        // console.log(targetRole);
        // console.log(targetEmoji);
        // const role = message.guild.roles.cache.get(targetRole.slice(3, -1));
        // let emoji = targetEmoji;
        // if(targetEmoji.length > 1){
        //     emoji = message.guild.emojis.cache.get(targetEmoji.toString().split("\:")[2].slice(0,-1));
        // }
        // console.log(role);
        // console.log(emoji);
        // let notFound = true;
        
        // for(let channel of message.guild.channels.cache.values()){
        //     if(channel.type === "text") {
        //         try {
        //             const reactionMessage = await channel.messages.fetch(targetMessage);
        //             if(reactionMessage != null){
        //                 await this.client.provider.db.modelManager.models[0].create({
        //                     targetMessage: reactionMessage.id,
        //                     targetEmoji: emoji.id,
        //                     targetRole: role.id,
        //                     targetGuild: message.guild.id
        //                 });

        //                 notFound = false;
        //                 lib.startCollectors(this.client);
        //                 await reactionMessage.react(emoji);
        //                 return message.channel.send("Nové spojení mezi " + role.name + " a " + emoji.name + " vytvořeno");
        //             }
                    
        //         }
        //         catch (e) {
        //             if (e.name === "SequelizeUniqueConstraintError") {
        //                 console.log(e);
        //                 return message.channel.send("Používáte roli nebo emoji, které už má spojení");
        //             }
        //             else if(e.message === "Unknown Message"){
        //                 notFound = true;
        //             }
        //             else {
        //                 console.log(e);
        //                 return message.channel.send("Neznámá chyba při vytváření spojení");
        //             }
        //         }
        //     }
        // }
        // if(notFound){
        //     message.channel.send("Zpráva nebyla nalezena");
        // }
	},
};