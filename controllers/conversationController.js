const db = require('../models/index');
const errorController = require('./errorController');
const { Op } = require('sequelize');

module.exports.getConversation = async (req, res, next) => {
   try {
      const conversation = await db.Conversation.findAll({
         where: {
            [Op.or]: [{ user_1: req.user.user_name }, { user_2: req.user.user_name }],
         },
         include: [
            {
               model: db.Users,
               as: 'user_1_info',
               attributes: ['user_name', 'full_name', 'avatar'],
            },
            {
               model: db.Users,
               as: 'user_2_info',
               attributes: ['user_name', 'full_name', 'avatar'],
            },
         ],
         limit: 15,
         order: [['updatedAt', 'DESC']],
      });
      next(res.status(200).json({ conversation }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.getConversationByUserName = async (req, res, next) => {
   try {
      const conversation = await db.Conversation.findOne({
         where: {
            [Op.or]: [
               { [Op.and]: [{ user_1: req.user.user_name }, { user_2: req.params.userName }] },
               { [Op.and]: [{ user_1: req.params.userName }, { user_2: req.user.user_name }] },
            ],
         },
      });
      next(res.status(200).json({ conversation }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.checkedConversation = async (req, res, next) => {
   try {
      await db.Conversation.update(
         { checked: true },
         { where: { conversation_id: req.params.conversationId } },
      );
      next(res.status(200).json({ mes: 'message is checked' }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
