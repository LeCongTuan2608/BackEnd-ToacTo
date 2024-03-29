const db = require('../models/index');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const dotenv = require('dotenv');
const errorController = require('./errorController');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');
dotenv.config();
const Sequelize = require('sequelize');
// update user

const deleteFile = async (file) => {
   try {
      await cloudinary.api.delete_resources(file.filename, { resource_type: 'image' });
   } catch (error) {
      console.log('error:', error);
   }
};
module.exports.updateUserHandler = async (req, res, next) => {
   try {
      //check field not empty
      if (!(req.params.user_name || req.params.email))
         return next(
            errorController.errorHandler(
               res,
               'params email or user_name cannot be left blank',
               404,
            ),
         );

      //check user in header
      if (!(req.user.user_name !== req.params.user_name || req.user.email !== req.params.email))
         return next(
            errorController.errorHandler(res, 'You are not allowed to update this user', 403),
         );

      //1. find user by user_name
      const user = await db.users.findOne({
         where: {
            user_name: req.user.user_name,
         },
      });

      //2.if user not exists, return error
      if (!user) return next(errorController.errorHandler(res, `User not found!`, 404));

      //3. if user exists, check password

      //4. update user
      await db.users.update(
         { ...req.body },
         {
            where: {
               user_name: req.user.user_name,
            },
         },
      );
      next(
         res.status(200).json({
            message: 'updated success',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.uploadAvatarHandler = async (req, res, next) => {
   try {
      const file = req.file;
      //1. find user by user_name
      const user = await db.users.findOne({
         where: {
            user_name: req.user.user_name,
         },
      });
      //2.if user not exists, return error
      if (!user) return next(errorController.errorHandler(res, `User not found!`, 404));

      (user.avatar || user.avatar?.filename) && (await deleteFile(user.avatar));
      // 4. update user
      if (file) {
         user.avatar = {
            filename: file.filename,
            url: file.path,
         };
      } else {
         user.avatar = null;
      }
      await user.save();
      next(
         res.status(200).json({
            file,
         }),
      );
   } catch (error) {
      req.file && deleteFile(req.file);
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
// delete user
module.exports.deleteUserHandler = async (req, res, next) => {
   try {
      if (!(req.params.user_name || req.params.email))
         return next(
            errorController.errorHandler(
               res,
               'params user_name or email cannot be left blank',
               404,
            ),
         );
      if (req.user.role_id !== 1)
         return next(
            errorController.errorHandler(
               res,
               'You do not have permission to delete this user',
               403,
            ),
         );
      // remove refresh token
      await db.refresh_token.destroy({
         where: {
            user_name: req.params.user_name,
         },
         force: true,
      });
      //delete user
      await db.users.destroy({
         where: {
            [Op.or]: {
               user_name: req.params.user_name ? req.params.user_name : '',
               email: req.params.email ? req.params.email : '',
            },
         },
         force: true,
      });
      next(
         res.status(200).json({
            message: 'Delete user is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
// get posts of user
module.exports.getPostHandler = (req, res, next) => {
   try {
      next();
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

//get profile friend
// module.exports.getOtherUserProfileHandler = (req, res, next) => {
//    try {
//    } catch (error) {
//       console.log('error', error);
//       errorController.serverErrorHandle(error, res);
//    }
// };

//follow user other
module.exports.followHandler = async (req, res, next) => {
   try {
      const [result, created] = await db.follow.findOrCreate({
         where: {
            [Op.and]: [{ user_follow: req.params.user_follow }, { user_name: req.user.user_name }],
         },
         defaults: {
            user_follow: req.params.user_follow,
            user_name: req.user.user_name,
         },
      });
      if (!created) {
         await db.notification.destroy({
            where: Sequelize.literal(
               `JSON_EXTRACT(related, '$.followers') = '${req.user.user_name}' 
               AND JSON_EXTRACT(related, '$.followed') = '${req.params.user_follow}'`,
            ),
            focus: true,
         });
         await db.follow.destroy({
            where: {
               [Op.and]: [
                  { user_follow: req.params.user_follow },
                  { user_name: req.user.user_name },
               ],
            },
            focus: true,
         });
      } else {
         if (req.user.user_name !== req.params.user_follow) {
            await db.notification.create({
               sender: req.user.user_name,
               receiver: req.params.user_follow,
               title: 'New Follow',
               content: `has been following you.`,
               type: 'FOLLOW',
               related: {
                  followers: req.user.user_name,
                  followed: req.params.user_follow,
               },
            });
         }
      }
      next(
         res.status(201).json({
            message: 'Follow/unFollow is success.',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

//get following
module.exports.getFollowingHandler = async (req, res, next) => {
   try {
      const query = `SELECT a.id, b.user_name, b.full_name, b.avatar FROM follows a INNER JOIN users b 
      ON a.user_name = '${req.user.user_name}' and a.user_follow = b.user_name
      LIMIT ${parseInt(req.query.limit) || 10} OFFSET ${parseInt(req.query.offset) || 0}`;

      const results = await db.sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
      next(res.status(200).json({ results }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get followers
module.exports.getFollowersHandler = async (req, res, next) => {
   try {
      const query = `SELECT a.id, b.user_name, b.full_name, b.avatar FROM follows a INNER JOIN users b 
      ON a.user_follow = '${req.user.user_name}' and a.user_name = b.user_name
      LIMIT ${parseInt(req.query.limit) || 10} OFFSET ${parseInt(req.query.offset) || 0}`;

      const results = await db.sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
      next(
         res.status(200).json({
            results,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

//delete following user other (unfollow)
module.exports.unFollowHandler = async (req, res, next) => {
   try {
      //check field req body
      if (!req.params.id)
         return next(errorController.errorHandler(res, 'params id cannot be left blank!', 404));

      //2.check user unfollow exists in tb Following
      const user_follow = await db.following.findOne({
         where: {
            id: req.params.id,
         },
      });
      if (!user_follow)
         return next(errorController.errorHandler(res, 'you are not following this user!', 404));

      //3. remove user following (unfollow)
      await db.following.destroy({
         where: {
            [Op.and]: {
               user_name: user_follow.user_name,
               user_following: user_follow.user_following,
            },
         },
         force: true,
      });
      //3. remove user followers (unfollow)
      await db.followers.destroy({
         where: {
            [Op.and]: {
               user_name: user_follow.user_following,
               user_followers: user_follow.user_name,
            },
         },
         force: true,
      });
      res.status(200).json({
         message: 'unfollow success!',
      });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// // get suggest user
module.exports.getSuggestHandler = async (req, res, next) => {
   try {
      const query = `
      SELECT u.user_name, u.full_name, u.avatar, 
            (SELECT COUNT(*) FROM follows WHERE user_follow = u.user_name) AS follower
      FROM users u
      LEFT JOIN follows f ON u.user_name = f.user_follow AND f.user_name = '${req.user.user_name}'
      WHERE f.user_follow IS NULL AND u.user_name <> '${req.user.user_name}'
      ORDER BY follower DESC
      LIMIT ${parseInt(req.query.limit) || 10} OFFSET ${parseInt(req.query.offset) || 0}`;

      const results = await db.sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
      next(res.status(200).json({ results }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get friend when both users follow each other
module.exports.getFriendsHandler = async (req, res, next) => {
   try {
      const query = `SELECT a.id, c.user_name, c.full_name, c.avatar 
      FROM follows a INNER JOIN follows b 
      ON a.user_name = b.user_follow and b.user_name = a.user_follow and b.user_name = '${
         req.user.user_name
      }' 
      JOIN users c ON a.user_name = c.user_name
      LIMIT ${parseInt(req.query.limit) || 10} OFFSET ${parseInt(req.query.offset) || 0}`;

      const results = await db.sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
      next(res.status(200).json({ results }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

//get all user
module.exports.getAllUserHandler = async (req, res, next) => {
   try {
      const users = await db.users.findAll({
         attributes: ['user_name', 'full_name', 'gender', 'relationship', 'about', 'avatar'],
         order: Sequelize.literal('rand()'),
      });
      next(
         res.status(200).json({
            length: users?.length,
            data: users,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// search users
module.exports.searchUserHandler = async (req, res, next) => {
   try {
      const users = await db.users.findAll({
         where: {
            user_name: {
               [Op.substring]: req.params?.user_name !== ' ' ? req.params?.user_name.trim() : '@',
            },
         },
         attributes: ['user_name', 'full_name', 'relationship', 'about', 'avatar'],
      });
      next(
         res.status(200).json({
            length: users?.length,
            data: users,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// // blocked
module.exports.getUserBlockedHandler = async (req, res, next) => {
   try {
      if (!req.user.user_name)
         return next(errorController.errorHandler(res, 'user_name cannot be left blank!', 404));

      const userBlocked = await db.blocked_users.findAll({
         where: { user_name: req.user.user_name },
         attributes: ['id'],
         include: [
            {
               model: db.users,
               attributes: ['user_name', 'full_name', 'avatar'],
            },
         ],
      });
      next(
         res.status(200).json({
            data: userBlocked,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.userBlockedHandler = async (req, res, next) => {
   try {
      if (!req.body.user_blocked)
         return next(
            errorController.errorHandler(res, 'field user_blocked cannot be left blank!', 404),
         );
      //1. check user exists in db
      const user = await db.users.findOne({ where: { user_name: req.body.user_blocked } });
      if (!user) return next(errorController.errorHandler(res, 'This user not exists!', 404));

      //2. insert user blocked
      const [userBlocked, created] = await db.blocked_users.findOrCreate({
         where: {
            [Op.and]: [{ user_blocked: req.body.user_blocked }, { user_name: req.user.user_name }],
         },
         defaults: {
            user_blocked: req.body.user_blocked,
            user_name: req.user.user_name,
         },
      });
      if (!created) {
         await db.blocked_users.destroy({
            where: {
               [Op.and]: [
                  { user_blocked: req.body.user_blocked },
                  { user_name: req.user.user_name },
               ],
            },
            focus: true,
         });
      }
      next(
         res.status(201).json({
            message: 'blocked is success',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.userUnBlockedHandler = async (req, res, next) => {
   try {
      if (!req.params.id)
         return next(errorController.errorHandler(res, 'params id cannot be left blank!', 404));
      //1. check user exists in tb
      const userBlocked = await db.blocked_users.findOne({ where: { id: req.params.id } });
      if (!userBlocked) return next(errorController.errorHandler(res, 'This user not found!', 404));

      //2. delete
      await db.blocked_users.destroy({
         where: {
            id: req.params.id,
         },
         force: true,
      });
      next(
         res.status(200).json({
            message: 'unblock is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// //get user other
module.exports.getProfileUserHandler = async (req, res, next) => {
   try {
      if (!req.params.user_name)
         return next(
            errorController.errorHandler(res, `params user_name cannot be left blank!`, 404),
         );
      // find user
      const getUser = await db.users.findOne({
         where: { user_name: req.params.user_name },
         attributes: { exclude: ['pwd'] },
      });

      if (!getUser) return next(errorController.errorHandler(res, `This user not exists!`, 404));
      // rerturn data user
      next(
         res.status(200).json({
            result: getUser.dataValues,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.getBlockedByUserName = async (req, res, next) => {
   try {
      const blocked = await db.blocked_users.findAll({
         where: {
            [Op.or]: [
               {
                  [Op.and]: [
                     { user_blocked: req.params.userName },
                     { user_name: req.user.user_name },
                  ],
               },
               {
                  [Op.and]: [
                     { user_blocked: req.user.user_name },
                     { user_name: req.params.userName },
                  ],
               },
            ],
         },
      });
      next(res.status(200).json({ blocked }));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
// ===========================SEARCH======================================
module.exports.handleSearchAll = async (req, res, next) => {
   try {
      const { q, select } = req.query;
      const selectValue = select || all;
      if (selectValue === 'all') {
         const usersResults = await db.users.findAll({
            attributes: ['user_name', 'full_name', 'avatar', 'about'],
            where: {
               [Op.and]: [
                  {
                     [Op.or]: [
                        { full_name: { [Op.substring]: q } },
                        { user_name: { [Op.substring]: q } },
                     ],
                  },
                  { user_name: { [Op.not]: req.user.user_name } },
               ],
            },
            limit: parseInt(req.query?.limit) || 5,
            offset: parseInt(req.query?.offset) || 0,
            order: [['createdAt', 'DESC']],
         });
         const postsResults = await db.posts.findAll({
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
                  model: db.users,
                  attributes: ['user_name', 'full_name', 'avatar', 'about'],
                  as: 'user',
               },
               { model: db.posts_image, as: 'images' },
               { model: db.posts_video, as: 'videos' },
               {
                  model: db.blocked_posts,
                  as: 'block_posts',
               },
            ],
            where: {
               [Op.and]: [
                  { audience: { [Op.not]: 'private' } },
                  { ban: { [Op.not]: true } },
                  {
                     content: { [Op.substring]: q },
                  },
               ],
            },
            subQuery: false,
            limit: parseInt(req.query.limit) || 5,
            offset: parseInt(req.query.offset) || 0,
            order: [['createdAt', 'DESC']],
         });
         return next(res.status(200).json({ users: usersResults, posts: postsResults }));
      } else if (selectValue === 'post') {
         const postsResults = await db.posts.findAll({
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
                  model: db.users,
                  attributes: ['user_name', 'full_name', 'avatar', 'about'],
                  as: 'user',
               },
               { model: db.posts_image, as: 'images' },
               { model: db.posts_video, as: 'videos' },
               {
                  model: db.blocked_posts,
                  as: 'block_posts',
               },
            ],
            where: {
               [Op.and]: [
                  { audience: { [Op.not]: 'private' } },
                  { ban: { [Op.not]: true } },
                  {
                     content: { [Op.substring]: q },
                  },
               ],
            },
            subQuery: false,
            limit: parseInt(req.query.limit) || 15,
            offset: parseInt(req.query.offset) || 0,
            order: [['createdAt', 'DESC']],
         });
         return next(res.status(200).json({ posts: postsResults }));
      } else if (selectValue === 'people') {
         const usersResults = await db.users.findAll({
            attributes: ['user_name', 'full_name', 'avatar', 'about'],
            where: {
               [Op.and]: [
                  {
                     [Op.or]: [
                        { full_name: { [Op.substring]: q } },
                        { user_name: { [Op.substring]: q } },
                     ],
                  },
                  { user_name: { [Op.not]: req.user.user_name } },
               ],
            },
            limit: parseInt(req.query?.limit) || 5,
            offset: parseInt(req.query?.offset) || 0,
            order: [['createdAt', 'DESC']],
         });
         return next(res.status(200).json({ users: usersResults }));
      }
      return next(res.status(200).json({}));
   } catch (error) {
      console.log('error:', error);
      errorController.serverErrorHandle(error, res);
   }
};
