'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class posts extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.users.hasMany(posts, { foreignKey: 'user_posts', as: 'user' });
         posts.belongsTo(models.users, { foreignKey: 'user_posts', as: 'user' });
      }
   }
   posts.init(
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
         ban: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
         },
      },
      {
         sequelize,
         modelName: 'posts',
         timestamps: true,
      },
   );
   return posts;
};
