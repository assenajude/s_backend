'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class association extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      association.belongsToMany(models.member, {
        through: models.associated_members
      })
      association.hasMany(models.engagement)
    }
  };
  association.init({
    nom: DataTypes.STRING,
    code: DataTypes.STRING,
    avatar: DataTypes.STRING,
    cotisation: DataTypes.INTEGER,
    frequence: DataTypes.STRING,
    status: DataTypes.STRING,
    fonds: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'association',
  });
  return association;
};