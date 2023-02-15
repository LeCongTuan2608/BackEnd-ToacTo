'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Posts_img extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         models.Posts.hasMany(Posts_img, { foreignKey: 'posts_id' });
         // Posts_img.belongsTo(models.Posts, { foreignKey: 'posts_id' });
      }
   }
   Posts_img.init(
      {
         img: {
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
         modelName: 'Posts_img',
         timestamps: false,
      },
   );
   return Posts_img;
};
