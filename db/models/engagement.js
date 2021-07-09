'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class engagement extends Model {

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      engagement.belongsTo(models.member, {
        as: 'Creator',
        foreignKey: 'creatorId'
      })
      engagement.belongsToMany(models.member, {
        as: 'Votor',
        through: models.vote,
        foreignKey: 'engagementId',
        otherKey: 'votorId'
      })
      engagement.hasMany(models.tranche)
    }
  };
  engagement.init({
    libelle: {
      type: DataTypes.STRING,
      max: 50
    },
    montant: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    interetMontant: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    penalityMontant: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    solde: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    echeance: DataTypes.DATE,
    statut: {
      type: DataTypes.STRING,
      defaultValue: 'voting'
    },
    progression: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    accord: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    typeEngagement: {
      type: DataTypes.STRING,
      defaultValue: 'remboursable'
    }
  }, {
    sequelize,
    modelName: 'engagement',
  });
  return engagement;
};