const db = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const errorController = require('./errorController');
const { Op } = require('sequelize');
const cloudinary = require('cloudinary').v2;
dotenv.config();

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const hashingPassword = (password) => {
   return bcrypt.hashSync(password, saltRounds);
};
const comparePassword = (password, hash) => {
   return bcrypt.compareSync(password, hash);
};

const generateToken = (data, options) => {
   return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, options);
};
const generateRefreshToken = (data, options) => {
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
      const [user, created] = await db.users.findOrCreate({
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
      const existingUser = await db.users.findOne({
         where: {
            email: data.email,
         },
         attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      //2. if user not exists, return error
      if (!existingUser) return errorController.errorHandler(res, 'Email not found!', 400);

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

      const dateToken = 7;
      const dateRefreshToken = 30;
      // generate token
      const token = generateToken({ ...existingUser.dataValues }, { expiresIn: `${dateToken}d` });
      const refreshToken = generateRefreshToken(
         { ...existingUser.dataValues },
         { expiresIn: `${dateRefreshToken}d` },
      );
      //
      const currentDate = new Date(); // Lấy ngày hiện tại

      // Tạo ngày hết hạn của token
      const tokenExpires = new Date(currentDate);
      tokenExpires.setDate(tokenExpires.getDate() + dateToken); // Cộng thêm 7 ngày

      // Tạo ngày hết hạn của refreshToken
      const refreshTokenExpires = new Date(currentDate);
      refreshTokenExpires.setDate(refreshTokenExpires.getDate() + dateRefreshToken); //

      // luu refresh token vao database
      await db.refresh_token.create({
         user_name: existingUser.user_name,
         refreshToken,
      });
      res.status(200).json({
         ...existingUser.dataValues,
         token,
         refreshToken,
         type: 'Bearer',
         tokenExpires,
         refreshTokenExpires,
      });
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
      const user = await db.users.findOne({
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
      const { old_pwd, new_pwd } = req.body;
      //1. find user by user_name
      const user = await db.users.findOne({
         where: {
            user_name: req.user.user_name,
         },
      });
      //2.if user not exists, return error
      if (!user) return next(errorController.errorHandler(res, `This user does no exist!`, 404));
      //3. if user exists, check password
      const isPasswordValid = comparePassword(old_pwd, user.pwd);
      if (!isPasswordValid)
         return next(errorController.errorHandler(res, `Old password is not correct!!`, 403));

      const hashPassword = hashingPassword(new_pwd);
      //4. update password
      user.pwd = hashPassword;
      await user.save();

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
      const result = await db.users.findOne({
         where: {
            user_name: req.user.user_name,
         },
         attributes: { exclude: ['pwd'] },
      });

      next(res.status(200).json({ result }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.changeEmailHandler = async (req, res, next) => {
   try {
      if (!req.body.email)
         return next(errorController.errorHandler(res, `field email cannot be left blank!`, 400));
      const result = await db.users.findOne({
         where: {
            user_name: req.user.user_name,
         },
      });
      const checkEmail = await db.users.findOne({
         where: {
            email: req.body.email,
         },
      });

      //2.if user not exists, return error
      if (!result) return next(errorController.errorHandler(res, `This user does no exist!`, 404));
      //2.check email
      if (checkEmail)
         return next(errorController.errorHandler(res, `This email already exists!`, 404));
      result.email = req.body.email;
      result.save();

      next(res.status(200).json({ message: 'Changed email success' }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
