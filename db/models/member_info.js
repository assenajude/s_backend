'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class member_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  member_info.init({
    isRead: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'member_info',
  });
  return member_info;
};