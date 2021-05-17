'use strict';
const {
  Model
} = require('sequelize');
// const uppercaseFirst = str =>`${str[0].toUpperCase()}${str.substr(1)}`
module.exports = (sequelize, DataTypes) => {
  class engagement extends Model {
 /*   getEngager(options) {
      if(!this.engagerType) return Promise.resolve(null)
      const mixinMethodName = `get${uppercaseFirst(this.engagerType)}`;
      return this[mixinMethodName](options);
    }*/
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      engagement.belongsTo(models.member)
      /*engagement.addHook('afterFind', findResult => {
        if(!Array.isArray(findResult)) findResult = [findResult]
        for(instance of findResult) {
          if(instance.engagerType === 'association' && instance.association !== undefined) {
            instance.engager = instance.association
          } else if (instance.engagerType === 'associated_member' && instance.associated_member !== undefined) {
            instance.engager = instance.associated_member
          }
          delete instance.associated_member
          delete instance.dataValues.associated_member
          delete instance.association
          delete instance.dataValues.association

        }
      })*/
    }
  };
  engagement.init({
    libelle: DataTypes.STRING,
    montant: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    echeance: DataTypes.DATE,
    statut: DataTypes.STRING,
    progression: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    accord: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'engagement',
  });
  return engagement;
};