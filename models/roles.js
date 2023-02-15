'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Roles extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
      }
   }
   Roles.init(
      {
         role_id: {
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            unique: true,
         },
         role_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
         },
      },
      {
         sequelize,
         modelName: 'Roles',
         timestamps: false,
      },
   );
   return Roles;
};
