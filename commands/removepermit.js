const { channel_admins } = require("../config.json");

module.exports = {
    name: "removepermit",
    aliases: ["rmvp", "removep"],
    guildOnly: true,
    execute(message, args){
        let adminRole = args[1] + "_admin";
        //Zkontroluje počet argumentů
        if(args.length === 2) {
            //Najde u autora zprávy jestli má admina pro permitku kterou přiřazuje [permitka_admin]
            if (message.member.roles.find(function (element) {return element.name === adminRole;}) !== null) {
                let role = message.guild.roles.find(function (element) {
                    return element.name === args[1];
                });
                let member = message.mentions.members.first();
                //Zkusí, jestli jde uživateli odebrat permitka
                if (member.roles.find(function (element) {return element === role;}) !== null) {
                    try {
                        member.removeRole(role).catch(console.error);
                    }
                    catch {
                        message.channel.send("Tagnutý uživatel neexistuje.");
                        return;
                    }
                    message.channel.send("Permitka byla úspěšně odebrána");
                }
                else message.channel.send("Uživatel permitku nemá")
            }
            else message.channel.send("Nemáš oprávnění přiřazovat tuto permitku nebo permitka neexistuje.")
        }
        else message.channel.send("Příkaz musí mít dva argumenty.")

        /* OLD
        let adminFound = false;
        let roleFound = false;
        if(args.length === 2){
            //Projde každýho admina v seznamu
            for(let i = 0; i < channel_admins.length; i++) {
                //Porovná admina[i] a autor ID
                if (message.author.id === channel_admins[i].adminID) {
                    adminFound = true;
                    //Projde každý oprávnění na roli (roleIDs)
                    for (let y = 0; y < channel_admins[i].role.length; y++) {
                        //Porovná oprávnění uživatele na přidávání rolí se zadanou rolí
                        for(let x = 0; x < args.length; x++){
                            if (args[x].toLowerCase() === channel_admins[i].role[y]) {
                                roleFound = true;
                                let role = message.guild.roles.find("name", args[x]);
                                let member = message.mentions.members.first();
                                try{
                                    member.removeRole(role).catch(console.error);
                                }
                                catch{
                                    message.channel.send("Uživatel nemá permitku kterou se snažíte odstranit")
                                }
                                message.channel.send("Permitka byla úspěšně odebrána");
                            }
                        }
                    }
                    if(!roleFound){message.channel.send("Nemáš oprávnění přiřazovat tuto permitku.");}
                }
            }
            if(!adminFound){message.channel.send("Nemáš oprávnění psát tento příkaz.");}
        }
        else{message.channel.send("Příkaz musí mít dva argumenty.")}
        */
    }
};