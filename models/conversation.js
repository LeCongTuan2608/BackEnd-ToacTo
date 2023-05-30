'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Conversation extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         Conversation.belongsTo(models.Users, { foreignKey: 'user_1', as: 'user_1_info' });
         Conversation.belongsTo(models.Users, { foreignKey: 'user_2', as: 'user_2_info' });
         Conversation.belongsTo(models.Users, { foreignKey: 'sender' });
      }
   }
   Conversation.init(
      {
         conversation_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
         },
         user_1: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
            references: {
               model: 'Users', // Tên bảng liên kết
               key: 'user_name', // Tên cột khóa chính trong bảng liên kết
            },
         },
         user_2: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
            references: {
               model: 'Users', // Tên bảng liên kết
               key: 'user_name', // Tên cột khóa chính trong bảng liên kết
            },
         },
         sender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         last_message: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         checked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
         },
      },
      {
         sequelize,
         modelName: 'Conversation',
         timestamps: true,
      },
   );
   return Conversation;
};
