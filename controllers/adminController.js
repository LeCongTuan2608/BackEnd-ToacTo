const db = require('../models/index');

const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op, Sequelize } = require('sequelize');
dotenv.config();

module.exports.getAllUsersHandler = async (req, res, next) => {
   try {
      if (req.user.role_id !== 1)
         return errorController.errorHandler(res, 'You do not have access!!', 403);
      const results = await db.Users.findAll({
         where: {
            [Op.and]: [
               { user_name: { [Op.not]: req.user.user_name } },
               // {
               //    ban: { [Op.not]: true },
               // },
            ],
         },
         include: [
            {
               model: db.Roles,
               as: 'role',
               attributes: ['role_name'],
            },
         ],
      });
      res.status(200).json({ results });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.getAllPostsHandler = async (req, res, next) => {
   try {
      if (req.user.role_id !== 1)
         return errorController.errorHandler(res, 'You do not have access!!', 403);
      const results = await db.Posts.findAll({
         attributes: {
            exclude: ['user_posts'],
            include: [
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM likeds WHERE likeds.posts_id = posts.posts_id)',
                  ),
                  'like_count',
               ],
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM comments WHERE comments.posts_id = posts.posts_id)',
                  ),
                  'comment_count',
               ],
               [
                  Sequelize.literal(`
                       EXISTS (
                         SELECT 1
                         FROM likeds
                         WHERE likeds.posts_id = posts.posts_id
                           AND likeds.user_liked_posts = '${req.user.user_name}'
                       )`),
                  'status_liked',
               ],
            ],
         },
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
               as: 'user',
            },
            { model: db.Posts_image, as: 'images' },
            { model: db.Posts_video, as: 'videos' },
            {
               model: db.Blocked_posts,
               as: 'block_posts',
            },
         ],
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });

      res.status(200).json({ results });
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
module.exports.getBannedUsersHandler = async (req, res, next) => {
   try {
      if (req.user.role_id !== 1)
         return errorController.errorHandler(res, 'You do not have access!!', 403);

      const results = await db.Users.findAll({
         where: {
            [Op.and]: [
               { user_name: { [Op.not]: req.user.user_name } },
               {
                  ban: { [Op.not]: false },
               },
            ],
         },
         include: [
            {
               model: db.Roles,
               as: 'role',
               attributes: ['role_name'],
            },
         ],
         limit: parseInt(req.query?.limit) || 15,
         offset: parseInt(req.query?.offset) || 0,
      });
      next(res.status(200).json({ results }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.getBannedPostsHandler = async (req, res, next) => {
   try {
      if (req.user.role_id !== 1)
         return errorController.errorHandler(res, 'You do not have access!!', 403);

      const results = await db.Posts.findAll({
         attributes: {
            exclude: ['user_posts'],
            include: [
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM likeds WHERE likeds.posts_id = posts.posts_id)',
                  ),
                  'like_count',
               ],
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM comments WHERE comments.posts_id = posts.posts_id)',
                  ),
                  'comment_count',
               ],
               [
                  Sequelize.literal(`
                       EXISTS (
                         SELECT 1
                         FROM likeds
                         WHERE likeds.posts_id = posts.posts_id
                           AND likeds.user_liked_posts = '${req.user.user_name}'
                       )`),
                  'status_liked',
               ],
            ],
         },
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
               as: 'user',
            },
            { model: db.Posts_image, as: 'images' },
            { model: db.Posts_video, as: 'videos' },
            {
               model: db.Blocked_posts,
               as: 'block_posts',
            },
         ],
         where: {
            [Op.and]: [{ ban: { [Op.not]: false } }],
         },
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });

      next(res.status(200).json({ results }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
