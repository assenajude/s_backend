'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cotisation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      cotisation.belongsTo(models.member)
    }
  };
  cotisation.init({
    montant: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    motif: DataTypes.STRING,
    datePayement: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'cotisation',
  });
  return cotisation;
};