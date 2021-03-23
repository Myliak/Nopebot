const path = require('path');
const sqlite = require('sqlite');
const config = require("./config.json");
const { CommandoClient } = require('discord.js-commando');
const lib = require('./customFunctions.js');
const SequelizeProvider = require("./Sequelize.js");
const Sequelize = require('sequelize');

const client = new CommandoClient({
    commandPrefix: 'nope ',
    owner: '279616229793071105',
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ["admin", "Administrátoři"],
        ["public", "Veřejné"],
        ["private", "Soukromé (Channel admins)"]
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({help: false, unknownCommand: false})
    .registerCommandsIn(path.join(__dirname, "commands"));

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const roleConnections = sequelize.define('RoleConnections', {
    targetRole: {
        type: Sequelize.STRING,
        unique: true
    },
    targetEmoji: {
        type: Sequelize.STRING,
        unique: true
    },
    targetGuild: {
        type: Sequelize.STRING,
        unique: false
    },
    targetMessage: {
        type: Sequelize.STRING,
        unique: false
    }
});

client.setProvider(new SequelizeProvider(sequelize)).catch(console.error);

client.once('ready', async () => {
    roleConnections.sync();
    lib.startCollectors(client);

    console.log('Up and running!');
});

client.on('guildMemberAdd', async(member) => {
    const memberRole = member.guild.roles.cache.find(role => role.name.toLowerCase() == "Member".toLowerCase());
    member.roles.add(memberRole).catch(console.error);
});

client.on('error', console.error);

client.login(config.token);

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