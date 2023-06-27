'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class posts_image extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.posts.hasMany(posts_image, {
            as: 'images',
            foreignKey: 'posts_id',
         });
         // posts_image.belongsTo(models.posts, { foreignKey: 'posts_id' });
      }
   }
   posts_image.init(
      {
         url: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         filename: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         posts_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
      },
      {
         sequelize,
         modelName: 'posts_image',
         timestamps: false,
      },
   );
   return posts_image;
};
