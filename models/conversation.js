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
         // Conversation.belongsTo(models.Users, { foreignKey: 'user_1', as: 'user_1_info' });
         // Conversation.belongsTo(models.Users, { foreignKey: 'user_2', as: 'user_2_info' });
         // Conversation.belongsTo(models.Users, { foreignKey: 'sender' });
         Conversation.belongsToMany(models.Users, { through: 'UserConversation' });
         models.Users.belongsToMany(Conversation, { through: 'UserConversation' });
      }
   }
   Conversation.init(
      {
         id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
         },
         member: {
            type: DataTypes.JSON,
            allowNull: false,
         },
         member_remove_chat: {
            type: DataTypes.JSON,
            allowNull: true,
         },

         // user_1: {
         //    type: DataTypes.STRING,
         //    allowNull: false,
         //    validate: {
         //       not: ['^[a-z]+$', 'i'],
         //    },
         //    references: {
         //       model: 'Users', // Tên bảng liên kết
         //       key: 'user_name', // Tên cột khóa chính trong bảng liên kết
         //    },
         // },
         // user_2: {
         //    type: DataTypes.STRING,
         //    allowNull: false,
         //    validate: {
         //       not: ['^[a-z]+$', 'i'],
         //    },
         //    references: {
         //       model: 'Users', // Tên bảng liên kết
         //       key: 'user_name', // Tên cột khóa chính trong bảng liên kết
         //    },
         // },

         last_message: {
            type: DataTypes.JSON,
         },
         checked: {
            type: DataTypes.JSON,
            allowNull: true,
         },
         avatar: {
            type: DataTypes.STRING,
            allowNull: true,
         },
         group: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
         },
         group_name: {
            type: DataTypes.STRING,
            allowNull: true,
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
