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
            defaultValue: null,
         },
         last_message: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
         },
         checked: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
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
         modelName: 'conversation',
         timestamps: true,
      },
   );
   return Conversation;
};
