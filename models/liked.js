'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class liked extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.posts.hasMany(liked, { as: 'likes', foreignKey: 'posts_id' });
         liked.belongsTo(models.users, {
            foreignKey: 'user_liked_posts',
            as: 'user_info',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
         });
      }
   }
   liked.init(
      {
         posts_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         user_liked_posts: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
      },
      {
         sequelize,
         modelName: 'liked',
         timestamps: true,
      },
   );
   return liked;
};
