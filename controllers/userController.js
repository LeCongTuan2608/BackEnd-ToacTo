const db = require('../models/index');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op } = require('sequelize');
dotenv.config();
const Sequelize = require('sequelize');
// update user
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
      const user = await db.Users.findOne({
         where: {
            [Op.or]: {
               email: req.params.email ? req.params.email : '',
               user_name: req.params.user_name ? req.params.user_name : '',
            },
         },
      });

      //2.if user not exists, return error
      if (!user) return next(errorController.errorHandler(res, `User not found!`, 404));

      //3. if user exists, check password

      //4. update user
      await db.Users.update(
         { ...req.body },
         {
            where: {
               [Op.or]: {
                  email: req.params.email ? req.params.email : '',
                  user_name: req.params.user_name ? req.params.user_name : '',
               },
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
      await db.Users.destroy({
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
      if (!req.body.user_follow)
         return next(
            errorController.errorHandler(res, 'field user_follow cannot be left blank!', 404),
         );
      //1, check user exists
      const user = await db.Users.findOne({ where: { user_name: req.body.user_follow } });
      if (!user) return errorController.errorHandler(res, 'This user not exists!', 400);

      //2. find in tb following, if not exists new create, else return
      const [following, createdFollowing] = await db.Following.findOrCreate({
         where: {
            [Op.and]: [{ user_following: req.body.user_follow }, { user_name: req.user.user_name }],
         },
         defaults: {
            user_following: req.body.user_follow,
            user_name: req.user.user_name,
         },
      });
      if (!createdFollowing)
         return errorController.errorHandler(res, 'Already following this user!', 400);

      // //2. find in tb Followers, if not exists new create, else return
      const [followers, createdFollowers] = await db.Followers.findOrCreate({
         where: {
            [Op.and]: [{ user_name: req.body.user_follow }, { user_followers: req.user.user_name }],
         },
         defaults: {
            user_name: req.body.user_follow,
            user_followers: req.user.user_name,
         },
      });
      if (!createdFollowers)
         return errorController.errorHandler(res, 'Already followers this user!', 400);

      next(
         res.status(201).json({
            message: 'Follow is success.',
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
      if (!req.params.user_name)
         return next(
            errorController.errorHandler(res, 'params user_name cannot be left blank', 404),
         );
      const userFollowing = await db.Following.findAll({
         where: { user_name: req.params.user_name },
         attributes: ['id'],
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
            },
         ],
      });
      next(
         res.status(200).json({
            length: userFollowing?.length,
            data: userFollowing,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get followers
module.exports.getFollowersHandler = async (req, res, next) => {
   try {
      if (!req.params.user_name)
         return next(
            errorController.errorHandler(res, 'params user_name cannot be left blank', 404),
         );
      const userFollowing = await db.Followers.findAll({
         where: { user_name: req.params.user_name },
         attributes: ['id'],
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
            },
         ],
      });
      next(
         res.status(200).json({
            length: userFollowing?.length,
            data: userFollowing,
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
      const user_follow = await db.Following.findOne({
         where: {
            id: req.params.id,
         },
      });
      if (!user_follow)
         return next(errorController.errorHandler(res, 'you are not following this user!', 404));

      //3. remove user following (unfollow)
      await db.Following.destroy({
         where: {
            [Op.and]: {
               user_name: user_follow.user_name,
               user_following: user_follow.user_following,
            },
         },
         force: true,
      });
      //3. remove user followers (unfollow)
      await db.Followers.destroy({
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

// // get posts user other
// // module.exports.getUserOtherPostHandler = (req, res, next) => {
// //    try {
// //    } catch (error) {
// //       console.log('error', error);
// //       errorController.serverErrorHandle(error, res);
// //    }
// // };

// // get user online
// module.exports.getOnlineHandler = (req, res, next) => {
//    try {
//       next();
//    } catch (error) {
//       console.log('error', error);
//       errorController.serverErrorHandle(error, res);
//    }
// };

// // get suggest user
module.exports.getSuggestHandler = async (req, res, next) => {
   try {
      const user = await db.Users.findAll({
         attributes: ['user_name', 'full_name', 'gender', 'relationship', 'about', 'avatar'],
         order: Sequelize.literal('rand()'),
         limit: 10,
      });
      next(
         res.status(200).json({
            user,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get friend when both users follow each other
// module.exports.getFriendsHandler = (req, res, next) => {
//    try {
//       next();
//    } catch (error) {
//       console.log('error', error);
//       errorController.serverErrorHandle(error, res);
//    }
// };

//get all user
module.exports.getAllUserHandler = async (req, res, next) => {
   try {
      const users = await db.Users.findAll({
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
      const users = await db.Users.findAll({
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

      const userBlocked = await db.Blocked_users.findAll({
         where: { user_name: req.user.user_name },
         attributes: ['id'],
         include: [
            {
               model: db.Users,
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
      const user = await db.Users.findOne({ where: { user_name: req.body.user_blocked } });
      if (!user) return next(errorController.errorHandler(res, 'This user not exists!', 404));

      //2. insert user blocked
      const [userBlocked, created] = await db.Blocked_users.findOrCreate({
         where: { user_name: req.user.user_name },
         defaults: {
            user_blocked: req.body.user_blocked,
            user_name: req.user.user_name,
         },
      });
      if (userBlocked)
         return next(errorController.errorHandler(res, 'This user has been blocked!', 404));

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
      const userBlocked = await db.Blocked_users.findOne({ where: { id: req.params.id } });
      if (!userBlocked) return next(errorController.errorHandler(res, 'This user not found!', 404));

      //2. delete
      await db.Blocked_users.destroy({
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
module.exports.getProfileUserOtherHandler = async (req, res, next) => {
   try {
      if (!req.params.user_name)
         return next(
            errorController.errorHandler(res, `params user_name cannot be left blank!`, 404),
         );
      // find user
      const getUser = await db.Users.findOne({
         where: { user_name: req.params.user_name },
         attributes: { exclude: ['createdAt', 'updatedAt', 'role_id', 'pwd', 'phone', 'email'] },
      });
      if (!getUser) return next(errorController.errorHandler(res, `This user not exists!`, 404));
      // rerturn data user
      next(
         res.status(200).json({
            getUser,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
