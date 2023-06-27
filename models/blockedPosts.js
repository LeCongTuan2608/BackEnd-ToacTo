'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class blocked_posts extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         blocked_posts.belongsTo(models.users, {
            foreignKey: 'user_blocked_posts',
         });
         models.users.hasMany(blocked_posts, {
            foreignKey: 'user_blocked_posts',
         });

         blocked_posts.belongsTo(models.posts, { foreignKey: 'posts_id', as: 'posts' });
         models.posts.hasMany(blocked_posts, { foreignKey: 'posts_id', as: 'block_posts' });
      }
   }
   blocked_posts.init(
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
   return blocked_posts;
};
