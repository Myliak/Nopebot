const { Command } = require('discord.js-commando');
const config = require("../../config.json");

module.exports = class addpermitCommand extends Command {
    constructor(client){
        super(client, {
            name: "addpermit",
            aliases: ["addp"],
            group:"private",
            memberName: "addpermit",
            description: "Přidává permitku uživateli \n Pouze pro channel admina",
            guildOnly: "true",
            args:[
                {
                    key: "targetUser",
                    prompt: "Tagněte uživatele, který dostane permitku",
                    type: "string"
                },
                {
                    key: "targetRole",
                    prompt: "Zadejte přidávanou permitku slovem",
                    type: "string"
                }
            ]
        });
    }

    async run(message, { targetUser, targetRole }){
        const member = message.guild.members.cache.get(targetUser.slice(3,-1));
        const permitRole = message.guild.roles.cache.find(role => role.name.toLowerCase() == targetRole.toLowerCase());

        //Najde u autora zprávy jestli má admina pro permitku kterou přiřazuje [permitka_admin]
        if(message.member.roles.cache.find(role => role.name.toLowerCase() == (targetRole.toLowerCase() + "_admin")) !== undefined){
            //Zkontroluje jestli program správně našel mention uživatele a existující permitku
            if(permitRole !== null && member !== undefined) {
                //Zkontroluje jestli mention uživatel už permitku nemá
                if(member.roles.cache.find(role => role.name.toLowerCase() == targetRole.toLowerCase()) === undefined){
                    member.roles.add(permitRole).catch(console.error);
                    message.channel.send("Permitka byla úspěšně přidána.");
                } else message.channel.send("Uživatel permitku už má.");
            } else message.channel.send("Uživatel, kterému chcete dát permitku, neexistuje.")
        } else message.channel.send("Nemáš oprávnění přiřazovat tuto permitku nebo permitka neexistuje")
    }
}

// module.exports = {
//     name: "addpermit",
//     description: "Přidává permitku uživateli \n Pouze pro channel admina \n Argumenty se můžou prohazovat",
//     aliases: ["addp"],
//     usage: "nope addpermit [tagnutý uživatel] [název role slovem]",
//     guildOnly: true,
//     execute(message, args){
//         let member = message.mentions.members.first();
//         let permitRole = message.guild.roles.find(function(element){
//             if(element.name === args[0] || element.name === args[1]){
//                 return element.name
//             }
//         });
//         //Zkontroluje počet argumentů
//         if(args.length === 2){
//             //Najde u autora zprávy jestli má admina pro permitku kterou přiřazuje [permitka_admin]
//             let adminRole = permitRole.name + "_admin";
//             if(message.member.roles.find(function(element){return element.name === adminRole;}) !== null){
//                 //Zkontroluje jestli program správně našel mention uživatele a existující permitku
//                 if(permitRole !== null && member !== undefined) {
//                     //Zkontroluje jestli mention uživatel už permitku nemá
//                     if (member.roles.find(function (element) {return element === permitRole;}) === null){
//                         member.addRole(permitRole).catch(console.error);
//                         message.channel.send("Permitka byla úspěšně přidána.");
//                     }
//                     else message.channel.send("Uživatel permitku už má");
//                 }
//                 else message.channel.send("Uživatel, kterému chcete dát permitku, neexistuje.")
//             }
//             else message.channel.send("Nemáš oprávnění přiřazovat tuto permitku nebo permitka neexistuje")
//         }
//         else message.channel.send("Příkaz musí mít dva argumenty.")
//     }
// };