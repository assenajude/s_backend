'use strict';
const uppercaseFirst = str => `${str[0].toUpperCase()}${str.substr(1)}`;
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    getTransactionCreator(options) {
      if (!this.creatorType) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.creatorType)}`;
      return this[mixinMethodName](options);
    }


    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.user, {
        foreignKey: 'creatorId',
        constraints: false

      })
      transaction.belongsTo(models.member, {
        foreignKey: 'creatorId',
        constraints: false

      })
    }
  };
  transaction.init({
    libelle: DataTypes.STRING,
    number: DataTypes.STRING,
    typeTransac: DataTypes.STRING,
    reseau: DataTypes.STRING,
    montant: DataTypes.INTEGER,
    numero: DataTypes.STRING,
    statut: DataTypes.STRING,
    creatorType: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    },
    mode: {
      type: DataTypes.STRING,
      defaultValue: 'externe'
    }
  }, {
    sequelize,
    modelName: 'transaction',
  });
  transaction.addHook("afterFind", findResult => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (instance.creatorType === "user" && instance.user !== undefined) {
        instance.creator = instance.user;
      } else if (instance.creatorType === "member" && instance.member !== undefined) {
        instance.creator = instance.member;
      }
      // To prevent mistakes:
      delete instance.user;
      delete instance.dataValues.user;
      delete instance.member;
      delete instance.dataValues.member;
    }
  });
  return transaction;
};