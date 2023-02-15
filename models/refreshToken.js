'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class refresh_token extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         refresh_token.belongsTo(models.Users, { foreignKey: 'user_name' });
      }
   }
   refresh_token.init(
      {
         user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         refreshToken: {
            type: DataTypes.TEXT,
            allowNull: false,
         },
      },
      {
         sequelize,
         modelName: 'refresh_token',
         timestamps: false,
      },
   );
   return refresh_token;
};
