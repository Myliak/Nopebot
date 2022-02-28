const Sequelize = require('sequelize');

//Database connection
const DbConnection = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

//Model
const Guild = require('./model/Guild.js')(DbConnection);
const GuildSettings = require('./model/GuildSettings.js')(DbConnection);
const RoleConnection = require('./model/RoleConnection.js')(DbConnection);

//Sequelize relationships

//1:1 Guild:GuildSettings
Guild.hasOne(GuildSettings, {
    foreignKey: {
        type: Sequelize.STRING,
        allowNull: false,
        name: 'guild_id'
    },
    onDelete: 'CASCADE',
    as: 'settings'
});
GuildSettings.belongsTo(Guild,{
    foreignKey: {
        allowNull: false,
        name: 'guild_id'
    },
});

//1:n Guild:RoleConnection
Guild.hasMany(RoleConnection);
RoleConnection.belongsTo(Guild);

module.exports = { DbConnection, Guild, GuildSettings, RoleConnection };