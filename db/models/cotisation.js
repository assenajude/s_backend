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
      cotisation.belongsTo(models.association)
      cotisation.belongsToMany(models.member, {
        through: models.member_cotisation
      })
    }
  };
  cotisation.init({
    montant: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    motif: {
      type: DataTypes.STRING,
      max: 50
    },
    typeCotisation: {
      type: DataTypes.STRING,
      defaultValue: 'mensuel'
    },
    dateDebut: DataTypes.DATE,
    dateFin: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'cotisation',
  });
  return cotisation;
};