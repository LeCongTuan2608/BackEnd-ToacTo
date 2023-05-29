const db = require('../models/index');
const errorController = require('./errorController');
const { Op } = require('sequelize');

module.exports.getMessages = async (req, res, next) => {
   try {
      const messages = await db.Message.findAll({
         where: {
            conversation_id: req.params.conversationId,
         },
         limit: 15,
         order: [['updatedAt', 'DESC']],
      });

      next(res.status(200).json({ messages: messages.reverse() }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.createMessages = async (req, res, next) => {
   try {
      const { sender, content, receiver, conversation_id } = req.body;
      const [conversation, created] = await db.Conversation.findOrCreate({
         where: {
            conversation_id,
         },
         defaults: {
            user_1: sender,
            user_2: receiver,
            sender: sender,
            last_message: content,
         },
      });
      if (!created) {
         await db.Conversation.update(
            { last_message: content, sender: sender },
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
