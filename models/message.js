'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Message extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Conversation.hasMany(Message, { as: 'message', foreignKey: 'conversation_id' });
         //  Message.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });
      }
   }
   Message.init(
      {
         sender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         content: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         receiver: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
         conversation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
      },
      {
         sequelize,
         modelName: 'Message',
         timestamps: true,
      },
   );
   return Message;
};
