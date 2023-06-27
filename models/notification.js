'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class notification extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         //  models.users.hasMany(notification, { as: 'notification', foreignKey: 'conversation_id' });
         notification.belongsTo(models.users, { foreignKey: 'sender', as: 'notifi_sender' });
      }
   }
   notification.init(
      {
         sender: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         receiver: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         title: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         content: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         checked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
         },
         type: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         related: {
            type: DataTypes.JSON,
            defaultValue: null,
         },
      },
      {
         sequelize,
         modelName: 'notification',
         timestamps: true,
      },
   );
   return notification;
};
