'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class posts_video extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.posts.hasMany(posts_video, { as: 'videos', foreignKey: 'posts_id' });
         posts_video.belongsTo(models.posts, { as: 'posts', foreignKey: 'posts_id' });
      }
   }
   posts_video.init(
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
         modelName: 'posts_video',
         timestamps: false,
      },
   );
   return posts_video;
};
