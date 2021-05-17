'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class information extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      information.belongsTo(models.association)
      information.belongsToMany(models.member, {
        through: models.member_info
      })
    }
  };
  information.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    dateDebut: DataTypes.DATE,
    dateFin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'information',
  });
  return information;
};