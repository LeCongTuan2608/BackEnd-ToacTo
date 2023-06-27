'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Notification extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         //  models.Users.hasMany(Notification, { as: 'notification', foreignKey: 'conversation_id' });
         Notification.belongsTo(models.Users, { foreignKey: 'sender', as: 'notifi_sender' });
      }
   }
   Notification.init(
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
         modelName: 'Notification',
         timestamps: true,
      },
   );
   return Notification;
};
