'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Following extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Users.hasMany(Following, { foreignKey: 'user_name' });
         Following.belongsTo(models.Users, { foreignKey: 'user_following' });
      }
   }
   Following.init(
      {
         user_following: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         user_name: {
            type: DataTypes.STRING,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
      },
      {
         sequelize,
         modelName: 'Following',
         timestamps: true,
      },
   );
   return Following;
};
