const db = require('../models/index');
const errorController = require('./errorController');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
module.exports.getConversation = async (req, res, next) => {
   try {
      const [results, metadata] = await db.sequelize.query(
         `
         SELECT conversations.conversation_id, conversations.sender,conversations.last_message,conversations.checked,conversations.updatedAt, users.full_name, users.user_name, users.avatar
         FROM conversations 
         LEFT JOIN users ON 
            (conversations.user_2 = users.user_name AND conversations.user_1 = '${req.user.user_name}') 
            OR (conversations.user_1 = users.user_name AND conversations.user_2 = '${req.user.user_name}')
         WHERE conversations.user_1 = '${req.user.user_name}' OR conversations.user_2 = '${req.user.user_name}'
         ORDER BY conversations.updatedAt DESC
         LIMIT 10
         `,
      );
      next(res.status(200).json({ conversation: [...results] }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.getConversationByUserName = async (req, res, next) => {
   try {
      const [results, metadata] = await db.sequelize.query(
         `
         SELECT conversations.conversation_id, conversations.sender,conversations.last_message,conversations.checked,conversations.updatedAt, users.full_name, users.user_name, users.avatar
         FROM conversations 
         LEFT JOIN users ON 
           (conversations.user_2 = users.user_name AND conversations.user_1 = '${req.user.user_name}' AND conversations.user_2 = '${req.params.userName}') 
           OR (conversations.user_1 = users.user_name AND conversations.user_1 = '${req.params.userName}' and conversations.user_2 = '${req.user.user_name}')
           WHERE (conversations.user_1 = '${req.params.userName}' AND conversations.user_2 = '${req.user.user_name}')
             OR (conversations.user_1 = '${req.user.user_name}' AND conversations.user_2= '${req.params.userName}');
         `,
      );
      if (!results[0]) {
         const user_info = await db.Users.findOne({
            where: { user_name: req.params.userName },
            attributes: ['full_name', 'user_name', 'avatar'],
         });
         next(res.status(200).json({ conversation: user_info }));
      }
      next(res.status(200).json({ conversation: results[0] }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.checkedConversation = async (req, res, next) => {
   try {
      await db.Conversation.update(
         { checked: db.sequelize.literal('CASE WHEN checked = false THEN true ELSE false END') },
         { where: { conversation_id: req.params.conversationId } },
      );
      next(res.status(200).json({ mes: 'message is checked' }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
