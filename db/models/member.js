'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      member.belongsToMany(models.role, {
        through: 'member_roles'
      })
      member.belongsToMany(models.association, {
        through: models.associated_members
      })
      member.hasMany(models.engagement)
    }
  };
  member.init({
    username: DataTypes.STRING,
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    phone: DataTypes.STRING,
    adresse: DataTypes.STRING,
    fonds: DataTypes.INTEGER,
    avatar: DataTypes.STRING,
    pseudo: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'member',
  });
  return member;
};