const { Client, Intents } = require('discord.js');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const lib = require('./customFunctions.js');
const { getData } = require('./commands/enable');
const { DbConnection, Guild } = require('./dbObjects');

// Create a new client instance
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], 
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', () => {
    //Synchronize database
    // DbConnection.sync();
    DbConnection.sync({force: true}).then(async () => {
        const guildId = "409325973532704769";
        await Guild.create({ id: guildId, name: 'Nopeville', settings: { connections: true, permissions: true, nopeville: true } }, { include: 'settings' });
    });

    const rest = new REST({ version: '9' }).setToken(config.token);
    
    client.guilds.cache.forEach((value, key) => {
        (async () => {
            try {
                const guildCommands = await lib.getActiveCommands(key, false);
                let array = Array.from(guildCommands.values());
                array = array.map(x => x.getData());
    
                await rest.put(Routes.applicationGuildCommands(client.user.id, key), { body: array } );

                console.log('Successfully refreshed guild commands of ' + value.name + ":" + key);
            } catch (error) {
                console.error(error);
            }
        })();
    });

	console.log('Up and running!');
});

//Executing command file
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const commands = await lib.getActiveCommands(interaction.guildId, true);
	const command = commands.get(interaction.commandName);
    
	if (!command) return;

	try {
        if(command.permitted(interaction.member)){
            await command.execute(interaction);
        }
        else{
            await interaction.reply({ content: "You don't have permissions to use this command", ephemeral: true })
        }
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('guildCreate', async guild => {
    try{
        await Guild.create({ id: guild.id, name: guild.name, settings: {} }, { include: 'settings' });
        console.log("Registered guild: " + guild.name + ", " + guild.id);
    }
    catch(e){
        console.log(e);
    }
    
});

client.on('guildDelete', async guild => {
    try{
        await Guild.destroy({ where: { id: guild.id }});
        console.log("Unregistered guild: " + guild.name + ", " + guild.id)
    }
    catch(e){
        console.log(e)
    }
});

// Login to Discord with your client's token
client.login(config.token);