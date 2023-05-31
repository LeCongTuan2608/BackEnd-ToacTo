const db = require('../models/index');
const errorController = require('./errorController');
const { Op } = require('sequelize');

module.exports.getMessages = async (req, res, next) => {
   try {
      let messages;
      if (req.params.conversationId) {
         messages = await db.Message.findAll({
            where: {
               conversation_id: req?.params?.conversationId,
            },
            limit: 15,
            order: [['updatedAt', 'DESC']],
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
      const { sender, content, receiver, conversation_id } = req.body;
      console.log('req.body:', req.body);

      let conversation;
      if (!conversation_id) {
         conversation = await db.Conversation.create({
            user_1: sender,
            user_2: receiver,
            sender: sender,
            last_message: content,
         });
      } else {
         conversation = await db.Conversation.findOne({
            where: {
               conversation_id,
            },
         });
         await db.Conversation.update(
            { last_message: content, sender: sender, checked: false },
            {
               where: {
                  conversation_id,
               },
            },
         );
      }
      const message = await db.Message.create({
         sender: sender,
         content: content,
         receiver: receiver,
         conversation_id: conversation.conversation_id,
      });
      next(res.status(201).json({ message }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
