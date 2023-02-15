'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Comments extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Posts.hasMany(Comments, { foreignKey: 'posts_id' });
         Comments.belongsTo(models.Users, { foreignKey: 'user_comment' });
      }
   }
   Comments.init(
      {
         content: {
            allowNull: false,
            type: DataTypes.TEXT,
         },
         img: DataTypes.STRING,
         posts_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         user_comment: {
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
         modelName: 'Comments',
         timestamps: true,
      },
   );
   return Comments;
};
