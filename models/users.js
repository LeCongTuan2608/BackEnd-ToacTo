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
         Users.belongsTo(models.Roles, { foreignKey: 'role_id' });
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
            allowNull: false,
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
         avatar: DataTypes.STRING,
         about: DataTypes.TEXT,
         pwd: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               min: 6,
               not: ['^[a-z]+$', 'i'],
            },
         },
         role_id: {
            type: DataTypes.INTEGER,
            defaultValue: 2,
            //test
            references: {
               model: 'Roles',
               key: 'role_id',
            },
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
