const db = require('../models/index');
const errorController = require('./errorController');
const { Op } = require('sequelize');

module.exports.getMessages = async (req, res, next) => {
   try {
      let messages;
      if (req.params.conversationId) {
         messages = await db.Message.findAll({
            where: {
               [Op.and]: [
                  {
                     conversation_id: req.params?.conversationId,
                  },
                  {
                     [Op.or]: [
                        { member_remove_message: null },
                        {
                           member_remove_message: {
                              [Op.notLike]: [`%${req.user.user_name}%`],
                           },
                        },
                     ],
                  },
               ],
            },
            limit: 15,
            order: [['createdAt', 'DESC']],
         });
      }
      next(res.status(200).json({ messages: messages ? messages.reverse() : [] }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.createMessages = async (req, res, next) => {
   try {
      const { receiver, content, id } = req.body;
      let whereCondition = {};
      let last_message = {
         sender: req.user.user_name,
         content: content || null,
      };
      if (id) {
         whereCondition = { id };
      } else {
         whereCondition = {
            member: {
               [Op.and]: [{ [Op.substring]: req.user.user_name }, { [Op.substring]: receiver }],
            },
         };
      }
      const [result, created] = await db.Conversation.findOrCreate({
         where: whereCondition,
         defaults: {
            member: [req.user.user_name, ...receiver],
            last_message,
            checked: [req.user.user_name],
         },
      });
      // create message
      const message = await db.Message.create({
         sender: req.user.user_name,
         content: content,
         conversation_id: result.id,
      });
      // add User
      if (created) {
         const users = await db.Users.findAll({
            where: {
               user_name: result.member,
            },
         });
         await result.addUsers(users);
      }
      await db.Conversation.update(
         {
            last_message: { ...last_message, id: message.id },
            checked: [req.user.user_name],
            member_remove_chat: null,
         },
         { where: whereCondition },
      );

      next(res.status(201).json({ result, message, created }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.removeMessages = async (req, res, next) => {
   try {
      if (!req.params.mesId)
         return next(errorController.errorHandler(res, 'id message cannot be left blank', 404));

      let message = await db.Message.findByPk(req.params.mesId);
      if (message.sender === req.user.user_name) {
         message.member_remove_message = ['all'];
         await message.save();
      }
      if (message.sender !== req.user.user_name) {
         if (message.member_remove_message === null)
            message.member_remove_message = [req.user.user_name];
         else
            message.member_remove_message = [...message?.member_remove_message, req.user.user_name];
         await message.save();
      }
      // Kiểm tra nếu message.id trùng với last_message.id
      const conversation = await db.Conversation.findByPk(message.conversation_id);
      if (conversation.last_message && conversation.last_message.id === message.id) {
         conversation.last_message = { ...conversation.last_message, isRemove: true };
         conversation.checked = [...conversation.member];
         await conversation.save();
      }
      next(res.status(200).json({ message }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
