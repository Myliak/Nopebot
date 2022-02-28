const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('RoleConnections', {
        guild_id: {
            type: Sequelize.INTEGER,
        },
        roleId: {
            type: Sequelize.STRING,
            unique: true
        },
        emoji: {
            type: Sequelize.STRING,
            unique: true
        },
        messageId: {
            type: Sequelize.STRING,
            unique: false
        }
    });
};