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

      member.hasMany(models.cotisation)
      member.hasMany(models.engagement)
      member.belongsToMany(models.information, {
        through: models.member_info
      })
    }
  };
  member.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    statut: DataTypes.STRING,
    fonds: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    avatar: DataTypes.STRING,
    relation: DataTypes.STRING,
    adhesionDate: DataTypes.DATE,
    backImage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'member',
  });
  return member;
};