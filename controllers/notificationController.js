const db = require('../models/index');

const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op, Sequelize } = require('sequelize');
dotenv.config();

module.exports.getNotificationHandler = async (req, res, next) => {
   try {
      res.status(200).json({});
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.banUsersHandler = async (req, res, next) => {
   try {
      if (req.user.role_id !== 1)
         return errorController.errorHandler(res, 'You do not have access!!', 403);

      const result = await db.Users.findOne({
         where: {
            user_name: req.params.user_name,
         },
         attributes: { exclude: ['pwd'] },
      });
      if (!result) return errorController.errorHandler(res, 'This user does not exist!!', 404);

      if (result.ban) {
         result.ban = false;
      } else {
         result.ban = true;
      }
      await result.save();
      next(res.status(200).json({ result }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.banPostsHandler = async (req, res, next) => {
   try {
      if (req.user.role_id !== 1)
         return errorController.errorHandler(res, 'You do not have access!!', 403);

      const result = await db.Posts.findOne({
         where: {
            posts_id: req.params.id,
         },
      });
      if (!result) return errorController.errorHandler(res, 'This posts does not exist!!', 404);

      if (result.ban) {
         result.ban = false;
      } else {
         result.ban = true;
      }
      await result.save();
      next(res.status(200).json({ result }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
