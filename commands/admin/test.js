const lib = require("../../customFunctions.js");
const { Command } = require('discord.js-commando');

// module.exports = {
//     name: "test",
//     guildOnly: true,
//     execute(message, args) {
//         /*if(args.length > 0){
//             const embed = new RichEmbed()
//                 .setTitle(args[0] + " je gej")
//                 .setColor(0x851919)
//                 .setDescription("A má taky půlku mozku smileyface")
//                 .addField("nevím co tohle dělá Pepega", "už vím :)", true)
//                 .addField("tohle by mělo být napravo pls", "nevím co sem už kurva psát", true)
//                 .setImage("https://i.kym-cdn.com/entries/icons/original/000/021/311/free.jpg")
//                 .setTimestamp()
//                 .setFooter("jsem noha :D");
//             message.channel.send(embed);
//         }*/
//         message.channel.send("Jsem testovací command a momentálně nemám využití, nech mě být (•_•)");
//     }
// };

module.exports = class testCommand extends Command {
    constructor(client) {
        super(client, {
            name: "test",
            group: "admin",
            memberName: "test",
            description: "Test",
            guildOnly: "true"
        });
    }

    async run(message)
    {
        lib.startCollectors(this.client);
    }
}