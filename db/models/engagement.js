'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class engagement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      engagement.belongsTo(models.member)
      engagement.belongsTo(models.association)
    }
  };
  engagement.init({
    libelle: DataTypes.STRING,
    montant: DataTypes.INTEGER,
    echeance: DataTypes.DATE,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'engagement',
  });
  return engagement;
};