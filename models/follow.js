'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Follow extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         //  models.Users.hasMany(Follow, { foreignKey: 'user_name' });
         //  Follow.belongsTo(models.Users, { foreignKey: 'user_follow' });
         //
         Follow.belongsTo(models.Users, {
            foreignKey: 'user_follow',
            targetKey: 'user_name',
         });
         Follow.belongsTo(models.Users, {
            foreignKey: 'user_name',
            targetKey: 'user_name',
         });
      }
   }
   Follow.init(
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
         modelName: 'Follow',
         timestamps: true,
      },
   );
   return Follow;
};
