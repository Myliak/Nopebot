module.exports = {
    name: "status",
    description: "Mění status bota \n Pouze pro server admina",
    usage: "nope status [typ statusu] [text statusu]",
    guildOnly: true,
    execute(message, args, client){
        if (args.length === 2){
            if(message.member.roles.find(function(element) {return element.name === "Leaders";}) !== null){
                switch(args[0].toUpperCase()){
                    case "WATCHING":
                        client.user.setActivity(args[1], {type: "WATCHING"});
                        message.channel.send("Status úspěšně změněn.");
                        break;
                    case "LISTENING":
                        client.user.setActivity(args[1], {type: "LISTENING"});
                        message.channel.send("Status úspěšně změněn.");
                        break;
                    case "PLAYING":
                        client.user.setActivity(args[1], {type: "PLAYING"});
                        message.channel.send("Status úspěšně změněn.");
                        break;
                    default:
                        message.channel.send("Neplatný typ statusu (Watching, Listening, Playing");
                        break;
                }
            }
            else message.channel.send("Nemáš oprávnění používat tento příkaz.")
        }
    }
};