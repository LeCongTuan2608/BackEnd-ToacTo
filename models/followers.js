'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Followers extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Users.hasMany(Followers, { foreignKey: 'user_name' });
         Followers.belongsTo(models.Users, { foreignKey: 'user_followers' });
      }
   }
   Followers.init(
      {
         user_followers: {
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
         modelName: 'Followers',
         timestamps: true,
      },
   );
   return Followers;
};
