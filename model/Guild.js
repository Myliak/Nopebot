const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("Guild", {
        id: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
        }
    });
};