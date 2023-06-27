const db = require('../models/index');

const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op, Sequelize } = require('sequelize');
dotenv.config();

module.exports.getNotificationHandler = async (req, res, next) => {
   try {
      const results = await db.Notification.findAll({
         where: {
            receiver: req.user.user_name,
         },
         include: [
            {
               model: db.Users,
               as: 'notifi_sender',
               attributes: ['user_name', 'full_name', 'avatar'],
            },
         ],
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });
      const notificationCount = await db.Notification.count({
         where: {
            receiver: req.user.user_name,
            checked: false,
         },
      });
      res.status(200).json({ results, notificationCount });
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
