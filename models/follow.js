'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class follow extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         follow.belongsTo(models.users, {
            foreignKey: 'user_follow',
            targetKey: 'user_name',
         });
         follow.belongsTo(models.users, {
            foreignKey: 'user_name',
            targetKey: 'user_name',
         });
      }
   }
   follow.init(
      {
         user_follow: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         user_name: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
      },
      {
         sequelize,
         modelName: 'follow',
         timestamps: true,
      },
   );
   return follow;
};
