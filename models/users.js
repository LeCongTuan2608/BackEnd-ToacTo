'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Users extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         Users.belongsTo(models.Roles, { foreignKey: 'role_id', as: 'role' });
         models.Roles.hasMany(Users, { foreignKey: 'role_id' });
      }
   }
   Users.init(
      {
         user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
               isEmail: true,
            },
         },
         full_name: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         birth_day: {
            type: DataTypes.DATE,
         },
         gender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               isIn: [['male', 'female', 'other']],
            },
         },
         relationship: {
            type: DataTypes.STRING,
            validate: {
               isIn: [['Single', 'Date', 'Married']],
            },
         },
         phone: DataTypes.STRING,
         location: DataTypes.TEXT,
         avatar: {
            type: DataTypes.JSON,
            allowNull: true,
         },
         about: DataTypes.TEXT,
         pwd: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               min: 6,
               not: ['^[a-z]+$', 'i'],
            },
         },
         public_info: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
         },
         ban: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
         },
         role_id: {
            type: DataTypes.INTEGER,
            defaultValue: 2,
         },
      },
      {
         sequelize,
         modelName: 'Users',
         timestamps: true,
      },
   );
   return Users;
};
