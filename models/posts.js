'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Posts extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Users.hasMany(Posts, { foreignKey: 'user_posts', as: 'user' });
         Posts.belongsTo(models.Users, { foreignKey: 'user_posts', as: 'user' });
      }
   }
   Posts.init(
      {
         posts_id: {
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
         },
         audience: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
               isIn: [['public', 'friends', 'private']],
            },
         },
         content: {
            type: DataTypes.TEXT,
            allowNull: false,
         },
         user_posts: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               not: ['^[a-z]+$', 'i'],
            },
         },
      },
      {
         sequelize,
         modelName: 'Posts',
         timestamps: true,
      },
   );
   return Posts;
};
