'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      nom: {
        type: Sequelize.STRING
      },
      prenom: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      adresse: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.STRING
      },
      piece: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      profession: {
        type: Sequelize.STRING
      },
      emploi: {
        type: Sequelize.STRING
      },
      pushNotificationToken: {
        type: Sequelize.STRING
      },
      wallet: {
        type: Sequelize.INTEGER,
      },
      isFirstTimeConnect: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};