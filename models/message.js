'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class message extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.conversation.hasMany(message, { as: 'message', foreignKey: 'conversation_id' });
         message.belongsTo(models.users, { foreignKey: 'sender' });
      }
   }
   message.init(
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
         member_remove_message: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
         },
         conversation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
      },
      {
         sequelize,
         modelName: 'message',
         timestamps: true,
      },
   );
   return message;
};
