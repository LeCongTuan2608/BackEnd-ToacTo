'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Blocked_users extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Users.hasMany(Blocked_users, { foreignKey: 'user_name' });
         Blocked_users.belongsTo(models.Users, { foreignKey: 'user_blocked' });
      }
   }
   Blocked_users.init(
      {
         user_blocked: {
            allowNull: false,
            type: DataTypes.STRING,
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
         modelName: 'Blocked_users',
         timestamps: true,
      },
   );
   return Blocked_users;
};
