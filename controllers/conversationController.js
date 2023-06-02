const db = require('../models/index');
const errorController = require('./errorController');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

module.exports.createConversation = async (req, res, next) => {
   try {
      const { member, last_message, group, group_name, avatar } = req.body;
      const created = await db.Conversation.create({
         member: member,
         last_message: {
            sender: req.user.user_name,
            content: last_message.content || null,
         },
         group_name: (group && group_name) || null,
         avatar: (group && avatar) || null,
         checked: [],
      });
      const users = await db.Users.findAll({
         where: {
            user_name: created.member,
         },
      });
      await created.addUsers(users);
      next(res.status(200).json({ created }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.getConversation = async (req, res, next) => {
   try {
      const conversation = await db.Conversation.findAll({
         where: {
            [Op.and]: [
               {
                  member: {
                     [Op.substring]: req.user.user_name,
                  },
               },
               {
                  [Op.or]: [
                     { member_remove_chat: null },
                     {
                        member_remove_chat: {
                           [Op.notLike]: [`%${req.user.user_name}%`],
                        },
                     },
                  ],
               },
            ],
         },
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'avatar'],
               through: {
                  attributes: [],
               },
            },
         ],
         limit: 10,
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
            [Op.and]: [
               {
                  member: {
                     [Op.and]: [
                        { [Op.substring]: req.user.user_name },
                        { [Op.substring]: req.params.userName },
                     ],
                  },
               },
               { group: false },
            ],
         },
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'avatar'],
               through: {
                  attributes: [],
               },
            },
         ],
      });
      next(res.status(200).json({ conversation }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.checkedConversation = async (req, res, next) => {
   try {
      const result = await db.Conversation.findOne({
         where: {
            [Op.and]: [
               { id: req.params.conversationId },
               { member: { [Op.substring]: req.user.user_name } },
            ],
         },
      });
      if (result.checked !== null && !result.checked.includes(req.user.user_name))
         result.checked = [...result.checked, req.user.user_name];
      else result.checked = [req.user.user_name];
      await result.save();
      next(res.status(200).json({ result }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.removeConversation = async (req, res, next) => {
   try {
      const result = await db.Conversation.findOne({
         where: {
            [Op.and]: [
               { id: req.params.conversationId },
               { member: { [Op.substring]: req.user.user_name } },
            ],
         },
      });
      if (result.member_remove_chat !== null)
         result.member_remove_chat = [...result.member_remove_chat, req.user.user_name];
      else result.member_remove_chat = [req.user.user_name];
      await result.save();
      await db.Message.update(
         {
            member_remove_message: db.sequelize.literal(
               `JSON_ARRAY_APPEND(COALESCE(member_remove_message, '[]'), '$', '${req.user.user_name}')`,
            ),
         },
         { where: { conversation_id: req.params.conversationId } },
      );

      next(res.status(200).json({ result }));
      next(res.status(200).json({ mes: 'message is checked' }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
