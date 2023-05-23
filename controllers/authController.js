const db = require('../models/index');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op } = require('sequelize');
dotenv.config();

const hashingPassword = (password) => {
   return bcrypt.hashSync(password, saltRounds);
};
const comparePassword = (password, hash) => {
   return bcrypt.compareSync(password, hash);
};
//
const generateToken = (data) => {
   const options = {
      expiresIn: '7d',
   };
   return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, options);
};
const generateRefreshToken = (data) => {
   const options = {
      expiresIn: '30d',
   };
   return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, options);
};
// 1 register user
module.exports.registerHandler = async (req, res, next) => {
   try {
      const data = { ...req.body };
      if (!(data.email && data.user_name && data.birth_day && data.full_name && data.pwd))
         return errorController.errorHandler(
            res,
            'UserName, email, gender, birthDay, password cannot be left blank!',
            400,
         );
      //1. find user or create (if user not exists create new user, return error when user exists)
      const [user, created] = await db.Users.findOrCreate({
         where: {
            [Op.or]: {
               email: data.email,
               user_name: data.user_name,
            },
         },
         defaults: {
            user_name: data.user_name,
            email: data.email,
            full_name: data.full_name,
            birth_day: data.birth_day,
            gender: data.gender,
            relationship: data.relationship,
            phone: data.phone,
            location: data.location,
            avatar: data.avatar,
            about: data.about,
            pwd: hashingPassword(data.pwd),
            role_id: data.role_id,
         },
      });

      //2. if user exists, return error
      if (!created)
         return errorController.errorHandler(res, 'UserName or email already exists!', 400);

      res.status(201).json({
         mes: 'Register in successfully',
      });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// 2 login
module.exports.loginHandler = async (req, res, next) => {
   try {
      const data = { ...req.body };
      if (!((data.email || data.user_name) && data.pwd))
         return errorController.errorHandler(
            res,
            'Email or user_name and password cannot be left blank!',
            400,
         );
      //1. find user

      const existingUser = await db.Users.findOne({
         where: {
            [Op.or]: {
               email: data.email ? data.email : '',
               user_name: data.user_name ? data.user_name : '',
            },
         },
         attributes: { exclude: ['createdAt', 'updatedAt'] },
         // raw: true,
         // nest: true,
      });

      //2. if user not exists, return error
      if (!existingUser) return errorController.errorHandler(res, 'Email not found!', 400);

      //2. if user exists, check password
      const isPasswordValid = comparePassword(data.pwd, existingUser.pwd);
      if (!isPasswordValid)
         return errorController.errorHandler(res, 'Wrong email or password', 404);

      //3. find refresh token
      const removeToken = await db.refresh_token.findOne({
         where: { user_name: existingUser.dataValues['user_name'] },
      });
      //4. if refresh token exists, remove refresh token in db
      if (removeToken) {
         await db.refresh_token.destroy({
            where: {
               user_name: existingUser.dataValues['user_name'],
            },
         });
      }

      // xoa pwd khoi data tre ve
      delete existingUser.dataValues['pwd'];

      // tao token
      const token = generateToken({ ...existingUser.dataValues });
      const refreshToken = generateRefreshToken({ ...existingUser.dataValues });

      // luu refresh token vao database
      await db.refresh_token.create({
         user_name: existingUser.user_name,
         refreshToken,
      });

      res.status(200).json({ ...existingUser.dataValues, token, refreshToken, type: 'Bearer' });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// // 3 delete refresh token
module.exports.logoutHandler = async (req, res, next) => {
   try {
      if (!req.body.user_name)
         return next(errorController.errorHandler(res, `user_name cannot be left blank!`, 404));

      // 1.find user
      const user = await db.Users.findOne({
         where: {
            user_name: req.body.user_name,
         },
      });

      //2. if user not exists, return error
      if (!user) return next(errorController.errorHandler(res, `user_name not found!`, 404));

      //3.if user exists, remove refresh token
      await db.refresh_token.destroy({
         where: {
            user_name: req.body.user_name,
         },
         force: true,
      });
      res.status(200).json({
         message: 'logout success',
      });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// //4 forgot password
module.exports.forgotHandler = (req, res, next) => {
   try {
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// // 5 change password
module.exports.changePasswordHandler = async (req, res, next) => {
   try {
      const { user_name, old_pwd, new_pwd } = req.body;
      // check field body
      if (!(user_name && old_pwd && new_pwd))
         return next(
            errorController.errorHandler(
               res,
               `user_name, old_pwd, new_pwd cannot be left blank!`,
               404,
            ),
         );
      // check user_name in header
      if (user_name !== req.user.user_name)
         return next(
            errorController.errorHandler(res, `You are not allowed to delete this user`, 403),
         );
      //1. find user by user_name
      const user = await db.Users.findOne({
         where: {
            user_name: req.body.user_name,
         },
      });
      //2.if user not exists, return error
      if (!user) return next(errorController.errorHandler(res, `user_name not found!`, 404));
      //3. if user exists, check password
      const isPasswordValid = comparePassword(old_pwd, user.pwd);
      if (!isPasswordValid) return next(errorController.errorHandler(res, `Invalid password`, 403));

      const hashPassword = hashingPassword(new_pwd);
      //4. update password
      await db.Users.update(
         { pwd: hashPassword },
         {
            where: {
               user_name: req.body.user_name,
            },
         },
      );
      res.status(200).json({
         message: 'Changed password success',
      });
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// // 6 get user
module.exports.getUserHandler = async (req, res, next) => {
   try {
      next(res.status(200).json(req.user));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
