const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("GuildSettings", {
        guild_id: {
            type: Sequelize.STRING,
        },
        admin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        connections: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        permissions: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        music: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: false
    });
};