'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Liked extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Posts.hasMany(Liked, { as: 'likes', foreignKey: 'posts_id' });
         Liked.belongsTo(models.Users, { foreignKey: 'user_liked_posts' });
      }
   }
   Liked.init(
      {
         posts_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         user_liked_posts: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
      },
      {
         sequelize,
         modelName: 'Liked',
         timestamps: true,
      },
   );
   return Liked;
};
