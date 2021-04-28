'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class associated_member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      associated_member.hasMany(models.cotisation)
      associated_member.hasMany(models.engagement, {
        foreignKey: 'engagerId',
        constraints: false,
        scope: {
          engagerType: 'associated_member'
        }
      })
    }
  };
  associated_member.init({
    id: {
     type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    relation: DataTypes.STRING,
    motif: DataTypes.STRING,
    messageSent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'associated_member',
  });
  return associated_member;
};