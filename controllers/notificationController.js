const db = require('../models/index');

const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op, Sequelize } = require('sequelize');
dotenv.config();

module.exports.getNotificationHandler = async (req, res, next) => {
   try {
      const results = await db.notification.findAll({
         where: {
            receiver: req.user.user_name,
         },
         include: [
            {
               model: db.users,
               as: 'notifi_sender',
               attributes: ['user_name', 'full_name', 'avatar'],
            },
         ],
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });
      const notificationCount = await db.notification.count({
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

module.exports.checkedNotificationHandler = async (req, res, next) => {
   try {
      const result = await db.notification.findOne({ where: { id: req.params.id } });
      if (!result)
         return errorController.errorHandler(res, 'This notification does not exist!!', 404);

      if (result.checked) {
         result.checked = false;
      } else {
         result.checked = true;
      }
      await result.save();
      next(res.status(200).json({ result }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.deleteNotificationHandler = async (req, res, next) => {
   try {
      const result = await db.notification.findOne({ where: { id: req.params.id } });
      if (!result)
         return errorController.errorHandler(res, 'This notification does not exist!!', 404);

      await db.notification.destroy({ where: { id: result.id }, focus: true });

      next(res.status(200).json({ mes: 'delete is success.' }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.checkedAllNotificationHandler = async (req, res, next) => {
   try {
      await db.notification.update({ checked: true }, { where: { receiver: req.user.user_name } });
      next(res.status(200).json({ mes: 'checked is success.' }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
