const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('RoleConnections', {
        guild_id: {
            type: Sequelize.INTEGER,
        },
        role_id: {
            type: Sequelize.STRING
        },
        message_id: {
            type: Sequelize.STRING,
            unique: false
        },
        emote_id: {
            type: Sequelize.STRING,
            unique: true
        },
        emote_id_unicode: {
            type: Sequelize.BOOLEAN
        }
    });
};