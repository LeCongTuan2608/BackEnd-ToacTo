'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Blocked_posts extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         Blocked_posts.belongsTo(models.Users);
         models.Users.hasMany(Blocked_posts);
      }
   }
   Blocked_posts.init(
      {
         posts_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         user_blocked_posts: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
      },
      {
         sequelize,
         modelName: 'Blocked_posts',
         timestamps: true,
      },
   );
   return Blocked_posts;
};
