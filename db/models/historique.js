'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class historique extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  historique.init({
    histoType: DataTypes.STRING,
    description: DataTypes.STRING,
    histoData: DataTypes.ARRAY(DataTypes.JSON)
  }, {
    sequelize,
    modelName: 'historique',
  });
  return historique;
};