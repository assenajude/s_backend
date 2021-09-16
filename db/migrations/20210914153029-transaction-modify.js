'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('transactions', 'mode', {
          type: Sequelize.DataTypes.STRING,
          defaultValue: 'externe'
        }, { transaction: t }),
        queryInterface.addColumn('transactions', 'creatorType', {
          type: Sequelize.DataTypes.STRING,
          defaultValue: 'user'
        }, { transaction: t }),
        queryInterface.addColumn('transactions', 'creatorId', {
          type: Sequelize.DataTypes.INTEGER,
        }, { transaction: t }),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('transactions', 'mode', { transaction: t }),
        queryInterface.removeColumn('transactions', 'creatorType', { transaction: t }),
        queryInterface.removeColumn('transactions', 'creatorId', { transaction: t }),
      ]);
    });
  }
};

