const { Client, Collection, Intents } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const lib = require('./customFunctions.js');
const { getData } = require('./commands/enable');
const { DbConnection, Guild } = require('./dbObjects.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    //Synchronize database
    // DbConnection.sync();
    DbConnection.sync({force: true}).then(async () => {
        const guildId = "409325973532704769";
        await Guild.create({ id: guildId, name: 'Nopeville', settings: {} }, { include: 'settings' });
    });

    //Global command registering
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    //Read global commands (root of commands folder)
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.getData().name, command);
    }

    const rest = new REST({ version: '9' }).setToken(config.token);
    const guildId = '409325973532704769';

    // Registering REST
    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');
            let array = Array.from(client.commands.values());
            array = array.map(x => x.getData());

            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: array },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

	console.log('Up and running!');
});

//Executing command file
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
    
	if (!command) return;

	try {
		await command.execute(interaction);
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


// const path = require('path');
// const sqlite = require('sqlite');
// const config = require("./config.json");
// const { CommandoClient } = require('discord.js-commando');
// const lib = require('./customFunctions.js');
// const SequelizeProvider = require("./Sequelize.js");
// const Sequelize = require('sequelize');

// const client = new CommandoClient({
//     commandPrefix: 'nope ',
//     owner: '279616229793071105',
// });

// client.registry
//     .registerDefaultTypes()
//     .registerGroups([
//         ["admin", "Administrátoři"],
//         ["public", "Veřejné"],
//         ["private", "Soukromé (Channel admins)"]
//     ])
//     .registerDefaultGroups()
//     .registerDefaultCommands({help: false, unknownCommand: false})
//     .registerCommandsIn(path.join(__dirname, "commands"));

// const sequelize = new Sequelize('database', 'user', 'password', {
//     host: 'localhost',
//     dialect: 'sqlite',
//     logging: false,
//     storage: 'database.sqlite',
// });

// const roleConnections = sequelize.define('RoleConnections', {
//     targetRole: {
//         type: Sequelize.STRING,
//         unique: true
//     },
//     targetEmoji: {
//         type: Sequelize.STRING,
//         unique: true
//     },
//     targetGuild: {
//         type: Sequelize.STRING,
//         unique: false
//     },
//     targetMessage: {
//         type: Sequelize.STRING,
//         unique: false
//     }
// });

// client.setProvider(new SequelizeProvider(sequelize)).catch(console.error);

// client.once('ready', async () => {
//     roleConnections.sync();
//     lib.startCollectors(client);

//     console.log('Up and running!');
// });

// client.on('guildMemberAdd', async(member) => {
//     const memberRole = member.guild.roles.cache.find(role => role.name.toLowerCase() == "Member".toLowerCase());
//     member.roles.add(memberRole).catch(console.error);
// });

// client.on('error', console.error);

// client.login(config.token);

// var client = new Discord.Client();
// client.commands = new Discord.Collection();

// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//     const command = require(`./commands/${file}`);
//     client.commands.set(command.name, command);
// }

// const cooldowns = new Discord.Collection();

// client.once('ready', () => {
//     //client.user.setActivity(config.statusText, {type: config.statusType});
//     console.log('Up and running!');
// });

// client.on('message', message => {
//     if (!message.content.startsWith(config.prefix) || message.author.bot) return;

//     const args = message.content.slice(config.prefix.length).split(/ +/);
//     const commandName = args.shift().toLowerCase();

//     const command = client.commands.get(commandName)
//         || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

//     if (!command) return;

//     if (command.guildOnly && message.channel.type !== 'text') {
//         return message.reply('Příkaz nejde použít v soukromých zprávách');
//     }

//     if (!cooldowns.has(command.name)) {
//         cooldowns.set(command.name, new Discord.Collection());
//     }

//     const now = Date.now();
//     const timestamps = cooldowns.get(command.name);
//     const cooldownAmount = (command.cooldown || 3) * 1000;


//     try {
//         command.execute(message, args, client);
//     }
//     catch (error) {
//         console.error(error);
//         message.reply('Neznámá chyba při spouštění příkazu, napište Myliakovi, on to někdy opraví');
//     }
// });
// client.on('error', console.error);

// setTimeout(() => { client.login(config.token); }, 5000);