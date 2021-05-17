'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.belongsToMany(models.association, {
        through: models.member
      })
      user.belongsToMany(models.role, {
        through: 'user_roles'
      })
    }
  };
  user.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    phone: DataTypes.STRING,
    adresse: DataTypes.STRING,
    piece: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};