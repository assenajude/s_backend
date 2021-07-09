'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('engagements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      solde: {
        type: Sequelize.INTEGER,
      },
      penalityMontant: {
        type: Sequelize.INTEGER,
      },
      libelle: {
        type: Sequelize.STRING
      },
      statut: {
        type: Sequelize.STRING
      },
      montant: {
        type: Sequelize.INTEGER
      },
      interetMontant: {
        type: Sequelize.INTEGER,
      },
      echeance: {
        type: Sequelize.DATE
      },
      progression: {
        type: Sequelize.FLOAT,
      },
      accord: {
        type: Sequelize.BOOLEAN
      },
      typeEngagement: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('engagements');
  }
};