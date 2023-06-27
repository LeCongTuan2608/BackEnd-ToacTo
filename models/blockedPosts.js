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
         Blocked_posts.belongsTo(models.Users, {
            foreignKey: 'user_blocked_posts',
         });
         models.Users.hasMany(Blocked_posts, {
            foreignKey: 'user_blocked_posts',
         });

         Blocked_posts.belongsTo(models.Posts, { foreignKey: 'posts_id', as: 'posts' });
         models.Posts.hasMany(Blocked_posts, { foreignKey: 'posts_id', as: 'block_posts' });
      }
   }
   Blocked_posts.init(
      {
         posts_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            type: DataTypes.INTEGER,
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
         modelName: 'blocked_posts',
         timestamps: true,
      },
   );
   return Blocked_posts;
};
