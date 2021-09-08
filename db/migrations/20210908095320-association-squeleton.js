'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('associations', 'isValid', {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false
        }, { transaction: t }),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('associations', 'isValid', { transaction: t }),
      ]);
    });
  }
};

