'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class associated_members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  associated_members.init({
    relation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'associated_members',
  });
  return associated_members;
};