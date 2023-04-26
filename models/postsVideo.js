'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Posts_video extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Posts.hasMany(Posts_video, { as: 'videos', foreignKey: 'posts_id' });
      }
   }
   Posts_video.init(
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
         modelName: 'Posts_video',
         timestamps: false,
      },
   );
   return Posts_video;
};
