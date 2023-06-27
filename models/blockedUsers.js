'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class blocked_users extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.users.hasMany(blocked_users, { foreignKey: 'user_name' });
         blocked_users.belongsTo(models.users, { foreignKey: 'user_blocked' });
      }
   }
   blocked_users.init(
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
         modelName: 'blocked_users',
         timestamps: true,
      },
   );
   return blocked_users;
};
