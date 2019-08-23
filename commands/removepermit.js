module.exports = {
    name: "removepermit",
    description: "Odebírá permitku uživateli \n Pouze pro channel admina \n Argumenty se můžou prohazovat",
    aliases: ["rmvp", "removep"],
    usage: "nope removepermit [tagnutý uživatel] [název role slovem]",
    guildOnly: true,
    execute(message, args){
        let member = message.mentions.members.first();
        let permitRole = message.guild.roles.find(function (element) {
            if(element.name === args[0] || element.name === args[1]){
                return element.name
            }
        });
        //Zkontroluje počet argumentů
        if(args.length === 2) {
            //Najde u autora zprávy jestli má admina pro permitku kterou přiřazuje [permitka_admin]
            let adminRole = permitRole.name + "_admin";
            if (message.member.roles.find(function (element) {return element.name === adminRole;}) !== null) {
                //Zkusí, jestli jde uživateli odebrat permitka
                if (member.roles.find(function (element) {return element === permitRole;}) !== null) {
                    try {
                        member.removeRole(permitRole).catch(console.error);
                    }
                    catch (error) {
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
    }
};