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
      cotisation.belongsTo(models.associated_member)
    }
  };
  cotisation.init({
    montant: DataTypes.INTEGER,
    motif: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'cotisation',
  });
  return cotisation;
};