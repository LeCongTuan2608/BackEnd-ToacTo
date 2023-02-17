'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Posts_image extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Posts.hasMany(Posts_image, {
            as: 'images',
            foreignKey: 'posts_id',
         });
         // Posts_image.belongsTo(models.Posts, { foreignKey: 'posts_id' });
      }
   }
   Posts_image.init(
      {
         url: {
            type: DataTypes.STRING,
            allowNull: false,
         },
         file_name: {
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
         modelName: 'Posts_image',
         timestamps: false,
      },
   );
   return Posts_image;
};
