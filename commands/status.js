module.exports = {
    name: "status",
    description: "Mění status bota \n Pouze pro server admina",
    usage: "nope status [typ statusu] [text statusu X krát]",
    guildOnly: true,
    execute(message, args, client){
        if (args.length >= 2){
            var statusString = "";
            if(message.member.roles.find(function(element) {return element.name === "Leaders";}) !== null){
                for(let i = 1; args.length > i; i++){
                    statusString += (args[i] + " ");
                }
                switch(args[0].toUpperCase()){
                    case "WATCHING":
                        client.user.setActivity(statusString, {type: "WATCHING"});
                        message.channel.send("Status úspěšně změněn.");
                        break;
                    case "LISTENING":
                        client.user.setActivity(statusString, {type: "LISTENING"});
                        message.channel.send("Status úspěšně změněn.");
                        break;
                    case "PLAYING":
                        client.user.setActivity(statusString, {type: "PLAYING"});
                        message.channel.send("Status úspěšně změněn.");
                        break;
                    default:
                        message.channel.send("Neplatný typ statusu (Watching, Listening, Playing");
                        break;
                }
            }
            else message.channel.send("Nemáš oprávnění používat tento příkaz.")
        }
        else message.channel.send("Špatný počet argumentů")
    }
};